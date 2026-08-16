'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Clock, UserCheck, UserMinus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { StatCard } from '@/components/stat-card';
import { DateRangePicker, type DateRange } from '@/components/date-range-picker';
import { DepartmentFilter } from '@/components/department-filter';
import { AttendanceTrendChart } from '@/components/attendance-trend-chart';
import { DepartmentBreakdownChart } from '@/components/department-breakdown';
import { useDashboardSummary, useDashboardTrend } from '@/hooks/use-dashboard';

export default function AdminDashboardPage() {
  // Default: today, all departments.
  const [range, setRange] = useState<DateRange>({});
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);

  const filter = { start_date: range.start_date, end_date: range.end_date, department_id: departmentId };
  const summary = useDashboardSummary(filter);
  const trend = useDashboardTrend(filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold text-ink-primary">Dashboard</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <DateRangePicker value={range} onChange={setRange} />
          <DepartmentFilter value={departmentId} onChange={setDepartmentId} />
        </div>
      </div>

      {summary.data && (
        <p className="text-sm text-ink-muted">
          Showing {format(new Date(summary.data.range.start_date), 'd MMM yyyy')}
          {summary.data.range.start_date !== summary.data.range.end_date &&
            ` – ${format(new Date(summary.data.range.end_date), 'd MMM yyyy')}`}
        </p>
      )}

      {summary.isLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : summary.data ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          <StatCard label="Active employees" value={summary.data.active_employees} icon={Users} />
          <StatCard label="Present" value={summary.data.present} icon={UserCheck} accent="present" />
          <StatCard label="Late" value={summary.data.late} icon={Clock} accent="late" />
          <StatCard label="Absent" value={summary.data.absent} icon={UserMinus} accent="absent" />
          <StatCard
            label="On-time rate"
            value={`${summary.data.on_time_rate}%`}
            hint={summary.data.average_clock_in_time ? `Avg. clock-in ${summary.data.average_clock_in_time}` : undefined}
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Daily attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {trend.isLoading ? <Skeleton className="h-64 w-full" /> : <AttendanceTrendChart data={trend.data ?? []} />}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>By department</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : summary.data?.by_department ? (
              <DepartmentBreakdownChart data={summary.data.by_department} />
            ) : (
              <p className="text-sm text-ink-muted">Filter to a single department to see its own trend above.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
