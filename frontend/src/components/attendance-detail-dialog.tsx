'use client';

import { format } from 'date-fns';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { LocationMap } from '@/components/location-map';
import type { AttendanceRecord } from '@/types/api';

interface AttendanceDetailDialogProps {
  record: AttendanceRecord | null;
  onOpenChange: (open: boolean) => void;
}

/** View-only — HRD reviews submitted attendance, never edits it. */
export function AttendanceDetailDialog({ record, onOpenChange }: AttendanceDetailDialogProps) {
  return (
    <Dialog open={!!record} onOpenChange={onOpenChange}>
      <DialogContent>
        {record && (
          <>
            <DialogHeader>
              <DialogTitle>{record.employee.full_name}</DialogTitle>
              <DialogDescription>
                {record.employee.department.name} · {format(new Date(record.work_date), 'EEEE, d MMMM yyyy')}
              </DialogDescription>
            </DialogHeader>

            <DialogBody>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={record.photo_url}
                alt={`${record.employee.full_name}'s clock-in proof`}
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />

              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-secondary">Clocked in at</span>
                <span className="font-medium text-ink-primary">{format(new Date(record.clock_in_at), 'HH:mm')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-secondary">Status</span>
                <Badge variant={record.status === 'LATE' ? 'late' : 'present'}>{record.status}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-ink-secondary">Late tolerance that day</span>
                <span className="text-ink-primary">{record.applied_late_tolerance_time}</span>
              </div>

              {record.latitude != null && record.longitude != null ? (
                <LocationMap latitude={record.latitude} longitude={record.longitude} />
              ) : (
                <p className="text-sm text-ink-muted">No location was captured for this record.</p>
              )}

              {record.notes && (
                <div>
                  <p className="text-sm text-ink-secondary">Notes</p>
                  <p className="mt-1 text-sm text-ink-primary">&ldquo;{record.notes}&rdquo;</p>
                </div>
              )}
            </DialogBody>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
