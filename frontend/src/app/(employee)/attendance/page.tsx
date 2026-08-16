'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { MapPin } from 'lucide-react';
import { DataTable, type DataTableColumn } from '@/components/data-table';
import { DateRangePicker, type DateRange } from '@/components/date-range-picker';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useMyAttendance } from '@/hooks/use-attendance';
import type { AttendanceRecord, AttendanceStatus } from '@/types/api';

const PAGE_SIZE = 10;

export default function MyAttendanceHistoryPage() {
  const [range, setRange] = useState<DateRange>({});
  const [status, setStatus] = useState<AttendanceStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);

  const query = useMyAttendance({
    start_date: range.start_date,
    end_date: range.end_date,
    status: status === 'ALL' ? undefined : status,
    page,
    limit: PAGE_SIZE,
  });

  const columns: DataTableColumn<AttendanceRecord>[] = [
    { key: 'date', header: 'Date', cell: (r) => format(new Date(r.work_date), 'EEE, d MMM yyyy') },
    { key: 'time', header: 'Clock-in time', cell: (r) => format(new Date(r.clock_in_at), 'HH:mm') },
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
          <a
            href={`https://www.google.com/maps?q=${r.latitude},${r.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-brand-accent-on-light hover:underline"
          >
            <MapPin className="h-3.5 w-3.5" /> View
          </a>
        ) : (
          <span className="text-ink-muted">—</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-ink-primary">Attendance history</h1>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <DateRangePicker value={range} onChange={(r) => { setRange(r); setPage(1); }} />
        <Select value={status} onValueChange={(v) => { setStatus(v as AttendanceStatus | 'ALL'); setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="PRESENT">Present</SelectItem>
            <SelectItem value="LATE">Late</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={query.data?.data ?? []}
        keyFor={(r) => r.id}
        isLoading={query.isLoading}
        emptyMessage="No attendance records for this range."
      />

      {query.data && query.data.meta.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-secondary">
          <span>
            Page {query.data.meta.page} of {query.data.meta.total_pages}
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
    </div>
  );
}
