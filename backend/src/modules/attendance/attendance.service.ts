import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { SettingsService } from '../settings/settings.service';
import { AttendanceGateway } from '../realtime/attendance.gateway';
import { evaluateClockIn } from './attendance.rules';
import { workDateOf } from '../../common/utils/date.util';
import { ClockInDto } from './dto/clock-in.dto';
import { AdminAttendanceQueryDto, MyAttendanceQueryDto } from './dto/attendance-query.dto';

const attendanceInclude = {
  employee: { include: { department: true } },
} as const;

type AttendanceWithRelations = Prisma.attendancesGetPayload<{ include: typeof attendanceInclude }>;

function serializeAttendance(row: AttendanceWithRelations) {
  return {
    id: row.id,
    work_date: row.work_date,
    clock_in_at: row.clock_in_at,
    photo_url: row.photo_url,
    latitude: row.latitude ? Number(row.latitude) : null,
    longitude: row.longitude ? Number(row.longitude) : null,
    status: row.status,
    applied_late_tolerance_time: row.applied_late_tolerance_time,
    notes: row.notes,
    employee: {
      id: row.employee.id,
      full_name: row.employee.full_name,
      department: { id: row.employee.department.id, name: row.employee.department.name },
    },
  };
}

@Injectable()
export class AttendanceService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
    private readonly settingsService: SettingsService,
    private readonly config: ConfigService,
    private readonly gateway: AttendanceGateway,
  ) {}

  private get timezone(): string {
    return this.config.get<string>('ATTENDANCE_TIMEZONE', 'Asia/Jakarta');
  }

  async clockIn(employeeId: number, dto: ClockInDto, file: Express.Multer.File | undefined) {
    if (!file) {
      throw new BadRequestException('A photo is required to clock in');
    }

    const settings = await this.settingsService.getAttendanceSettings();
    if (settings.require_location && (dto.latitude === undefined || dto.longitude === undefined)) {
      throw new BadRequestException('Location is required to clock in');
    }

    const now = new Date();
    const evaluation = evaluateClockIn({ now, timezone: this.timezone, settings });

    // Checked up front, before uploading, so the common "already clocked in
    // today" case never wastes a call to the storage helper.
    const existing = await this.prisma.attendances.findUnique({
      where: {
        employee_id_work_date: { employee_id: employeeId, work_date: evaluation.work_date },
      },
    });
    if (existing) {
      throw new ConflictException('You have already clocked in today');
    }

    const uploaded = await this.storage.upload(file);

    try {
      const created = await this.prisma.attendances.create({
        data: {
          employee_id: employeeId,
          work_date: evaluation.work_date,
          clock_in_at: now,
          photo_key: uploaded.key,
          photo_url: uploaded.url,
          latitude: dto.latitude,
          longitude: dto.longitude,
          status: evaluation.status,
          applied_late_tolerance_time: evaluation.applied_late_tolerance_time,
          notes: dto.notes,
        },
        include: attendanceInclude,
      });

      const serialized = serializeAttendance(created);
      this.gateway.emitAttendanceCreated(serialized);
      return serialized;
    } catch (error) {
      await this.storage.delete(uploaded.key);
      throw error;
    }
  }

  async findToday(employeeId: number) {
    const work_date = workDateOf(new Date(), this.timezone);
    const record = await this.prisma.attendances.findUnique({
      where: { employee_id_work_date: { employee_id: employeeId, work_date } },
      include: attendanceInclude,
    });
    return record ? serializeAttendance(record) : null;
  }

  async findMine(employeeId: number, query: MyAttendanceQueryDto) {
    const where: Prisma.attendancesWhereInput = {
      employee_id: employeeId,
      status: query.status,
      work_date: this.dateRange(query.start_date, query.end_date),
    };
    return this.paginate(where, query.page, query.limit);
  }

  async findAllForAdmin(query: AdminAttendanceQueryDto) {
    const where: Prisma.attendancesWhereInput = {
      status: query.status,
      work_date: this.dateRange(query.start_date, query.end_date),
      employee: {
        department_id: query.department_id,
        ...(query.search ? { full_name: { contains: query.search } } : {}),
      },
    };
    return this.paginate(where, query.page, query.limit);
  }

  async findOneForAdmin(id: number) {
    const record = await this.prisma.attendances.findUnique({
      where: { id },
      include: attendanceInclude,
    });
    return record ? serializeAttendance(record) : null;
  }

  private async paginate(where: Prisma.attendancesWhereInput, page: number, limit: number) {
    const [rows, total] = await Promise.all([
      this.prisma.attendances.findMany({
        where,
        include: attendanceInclude,
        orderBy: [{ work_date: 'desc' }, { clock_in_at: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.attendances.count({ where }),
    ]);
    return {
      data: rows.map(serializeAttendance),
      meta: { page, limit, total, total_pages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  private dateRange(start?: string, end?: string): Prisma.DateTimeFilter | undefined {
    if (!start && !end) return undefined;
    return {
      ...(start ? { gte: new Date(`${start}T00:00:00.000Z`) } : {}),
      ...(end ? { lte: new Date(`${end}T00:00:00.000Z`) } : {}),
    };
  }
}
