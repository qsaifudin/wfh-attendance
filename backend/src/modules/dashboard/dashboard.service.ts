import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { countWorkingDays, timeOfDay, workDateOf } from '../../common/utils/date.util';
import { DashboardQueryDto } from './dto/dashboard-query.dto';

interface DepartmentBreakdownRow {
  department_id: number;
  department_name: string;
  present: bigint | number;
  late: bigint | number;
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private get timezone(): string {
    return this.config.get<string>('ATTENDANCE_TIMEZONE', 'Asia/Jakarta');
  }

  private resolveRange(query: DashboardQueryDto) {
    if (!query.start_date && !query.end_date) {
      const today = workDateOf(new Date(), this.timezone);
      return { start: today, end: today, isSingleDay: true };
    }
    const start = query.start_date ? new Date(`${query.start_date}T00:00:00.000Z`) : undefined;
    const end = query.end_date ? new Date(`${query.end_date}T00:00:00.000Z`) : undefined;
    const resolvedStart = start ?? end!;
    const resolvedEnd = end ?? start!;
    const isSingleDay = resolvedStart.getTime() === resolvedEnd.getTime();
    return { start: resolvedStart, end: resolvedEnd, isSingleDay };
  }

  async summary(query: DashboardQueryDto) {
    const { start, end, isSingleDay } = this.resolveRange(query);
    const departmentWhere: Prisma.employeesWhereInput = query.department_id
      ? { department_id: query.department_id }
      : {};
    const dateWhere = { gte: start, lte: end };

    const [activeEmployees, presentCount, lateCount, clockIns, byDepartment] = await Promise.all([
      this.prisma.employees.count({ where: { ...departmentWhere, user: { status: 'ACTIVE' } } }),
      this.prisma.attendances.count({
        where: { status: 'PRESENT', work_date: dateWhere, employee: departmentWhere },
      }),
      this.prisma.attendances.count({
        where: { status: 'LATE', work_date: dateWhere, employee: departmentWhere },
      }),
      this.prisma.attendances.findMany({
        where: { work_date: dateWhere, employee: departmentWhere },
        select: { clock_in_at: true },
      }),
      query.department_id ? Promise.resolve(null) : this.departmentBreakdown(start, end),
    ]);

    const totalRecords = presentCount + lateCount;
    const expected = isSingleDay ? activeEmployees : activeEmployees * countWorkingDays(start, end);
    const absent = Math.max(0, expected - totalRecords);
    const onTimeRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 1000) / 10 : 0;

    return {
      range: { start_date: this.toDateString(start), end_date: this.toDateString(end) },
      active_employees: activeEmployees,
      present: presentCount,
      late: lateCount,
      absent,
      on_time_rate: onTimeRate,
      average_clock_in_time: this.averageTime(clockIns.map((c) => c.clock_in_at)),
      by_department: byDepartment,
    };
  }

  async trend(query: DashboardQueryDto) {
    const { start, end } = this.resolveRange(query);
    const departmentWhere: Prisma.employeesWhereInput = query.department_id
      ? { department_id: query.department_id }
      : {};

    const rows = await this.prisma.attendances.groupBy({
      by: ['work_date', 'status'],
      where: { work_date: { gte: start, lte: end }, employee: departmentWhere },
      _count: { _all: true },
    });

    const byDate = new Map<string, { work_date: string; present: number; late: number }>();
    for (const row of rows) {
      const key = this.toDateString(row.work_date);
      const entry = byDate.get(key) ?? { work_date: key, present: 0, late: 0 };
      if (row.status === 'PRESENT') entry.present = row._count._all;
      else entry.late = row._count._all;
      byDate.set(key, entry);
    }
    return Array.from(byDate.values()).sort((a, b) => a.work_date.localeCompare(b.work_date));
  }

  /** Needs a join Prisma's groupBy cannot express, so this one query is raw
   * SQL — identifiers below match the schema exactly since there is no
   * @map/@@map anywhere in this project. */
  private async departmentBreakdown(start: Date, end: Date) {
    const rows = await this.prisma.$queryRaw<DepartmentBreakdownRow[]>`
      SELECT
        d.id AS department_id,
        d.name AS department_name,
        SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) AS present,
        SUM(CASE WHEN a.status = 'LATE' THEN 1 ELSE 0 END) AS late
      FROM departments d
      LEFT JOIN employees e ON e.department_id = d.id
      LEFT JOIN attendances a ON a.employee_id = e.id AND a.work_date BETWEEN ${start} AND ${end}
      GROUP BY d.id, d.name
      ORDER BY d.name ASC
    `;
    // MySQL sends SUM() results as BigInt through the raw-query path —
    // JSON.stringify throws on BigInt, so these must be converted here.
    return rows.map((row) => ({
      department_id: row.department_id,
      department_name: row.department_name,
      present: Number(row.present),
      late: Number(row.late),
    }));
  }

  private averageTime(dates: Date[]): string | null {
    if (dates.length === 0) return null;
    const minutes = dates.map((d) => {
      const [h, m] = timeOfDay(d, this.timezone).split(':').map(Number);
      return h * 60 + m;
    });
    const avg = Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length);
    const h = Math.floor(avg / 60)
      .toString()
      .padStart(2, '0');
    const m = (avg % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }

  private toDateString(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
