'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { Search } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { DateRangePicker, type DateRange } from '@/components/date-range-picker';
import { DepartmentFilter } from '@/components/department-filter';
import { AttendanceDetailDialog } from '@/components/attendance-detail-dialog';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminAttendance } from '@/hooks/use-attendance';
import type { AttendanceRecord, AttendanceStatus } from '@/types/api';

const PAGE_SIZE = 10;

export default function AdminAttendancePage() {
  const [search, setSearch] = useState('');
  const [range, setRange] = useState<DateRange>({});
  const [departmentId, setDepartmentId] = useState<number | undefined>(undefined);
  const [status, setStatus] = useState<AttendanceStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AttendanceRecord | null>(null);

  const query = useAdminAttendance({
    search: search || undefined,
    start_date: range.start_date,
    end_date: range.end_date,
    department_id: departmentId,
    status: status === 'ALL' ? undefined : status,
    page,
    limit: PAGE_SIZE,
  });

  const columns: DataTableColumn<AttendanceRecord>[] = [
    { key: 'employee', header: 'Employee', cell: (r) => <span className="font-medium text-ink-primary">{r.employee.full_name}</span> },
    { key: 'department', header: 'Department', cell: (r) => r.employee.department.name },
    { key: 'date', header: 'Date', cell: (r) => format(new Date(r.work_date), 'd MMM yyyy') },
    { key: 'time', header: 'Time', cell: (r) => format(new Date(r.clock_in_at), 'HH:mm') },
    {
      key: 'status',
      header: 'Status',
      cell: (r) => <Badge variant={r.status === 'LATE' ? 'late' : 'present'}>{r.status}</Badge>,
    },
    {
      key: 'location',
      header: 'Location',
      cell: (r) =>
        r.latitude != null && r.longitude != null ? (
          <span className="tabular-nums text-ink-secondary">
            {r.latitude.toFixed(3)}, {r.longitude.toFixed(3)}
          </span>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (r) => (
        <div onClick={(evt) => evt.stopPropagation()}>
          <Button variant="ghost" size="sm" onClick={() => setSelected(r)}>
            View
          </Button>
        </div>
      ),
      className: 'whitespace-nowrap',
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-ink-primary">Attendance</h1>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <Input
              placeholder="Search by employee name"
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <DepartmentFilter value={departmentId} onChange={(v) => { setDepartmentId(v); setPage(1); }} />
          <Select value={status} onValueChange={(v) => { setStatus(v as AttendanceStatus | 'ALL'); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PRESENT">Present</SelectItem>
              <SelectItem value="LATE">Late</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DateRangePicker value={range} onChange={(r) => { setRange(r); setPage(1); }} />
      </div>

      <DataTable
        columns={columns}
        data={query.data?.data ?? []}
        keyFor={(r) => r.id}
        isLoading={query.isLoading}
        emptyMessage="No attendance records match these filters."
        onRowClick={setSelected}
      />

      {query.data && query.data.meta.total > 0 && (
        <div className="flex items-center justify-between text-sm text-ink-secondary">
          <span>
            Page {query.data.meta.page} of {query.data.meta.total_pages} ({query.data.meta.total} records)
          </span>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= query.data.meta.total_pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <AttendanceDetailDialog record={selected} onOpenChange={(open) => !open && setSelected(null)} />
    </div>
  );
}
