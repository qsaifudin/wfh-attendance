'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { TimePicker } from '@/components/ui/time-picker';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAttendanceSettings, useUpdateAttendanceSettings } from '@/hooks/use-settings';
import { useToast } from '@/hooks/use-toast';
import { apiErrorMessage } from '@/lib/api';
import { attendanceSettingsSchema, type AttendanceSettingsFormValues } from '@/schemas/settings.schema';
import type { AttendanceSettings } from '@/types/api';

export default function AdminSettingsPage() {
  const { data: settings, isLoading } = useAttendanceSettings();

  if (isLoading || !settings) {
    return (
      <div className="mx-auto max-w-lg space-y-4">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  // A separate component, keyed by the loaded settings, rather than one
  // useForm() fed by useEffect + reset(): reset() only corrects the form a
  // tick after the first paint, so anything reading it on that first paint
  // (TimePicker included) briefly sees the wrong value. Mounting this only
  // once real data exists means useForm's defaultValues are correct from
  // its very first render — there is no wrong-then-corrected step to race.
  return <AttendanceSettingsForm settings={settings} />;
}

function AttendanceSettingsForm({ settings }: { settings: AttendanceSettings }) {
  const update = useUpdateAttendanceSettings();
  const { push } = useToast();

  const form = useForm<AttendanceSettingsFormValues>({
    resolver: zodResolver(attendanceSettingsSchema),
    defaultValues: {
      late_tolerance_time: settings.late_tolerance_time,
      require_location: settings.require_location,
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    update.mutate(values, {
      onSuccess: () => push({ title: 'Settings saved', variant: 'success' }),
      onError: (error) => push({ title: 'Could not save settings', description: apiErrorMessage(error), variant: 'error' }),
    });
  });

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-xl font-semibold text-ink-primary">Attendance settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Late tolerance</CardTitle>
          <CardDescription>
            Employees who clock in after this time are marked late. Changes apply to future clock-ins only — past
            records keep the tolerance that applied when they were created.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="late_tolerance_time">Late tolerance time</Label>
              <Controller
                name="late_tolerance_time"
                control={form.control}
                render={({ field }) => (
                  <TimePicker value={field.value} onChange={field.onChange} disabled={update.isPending} />
                )}
              />
              {form.formState.errors.late_tolerance_time && (
                <p className="text-xs text-status-absent">{form.formState.errors.late_tolerance_time.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <p className="text-sm font-medium text-ink-primary">Require location to clock in</p>
                <p className="text-xs text-ink-secondary">
                  Turn off only if you expect clock-ins from devices without GPS.
                </p>
              </div>
              <Controller
                name="require_location"
                control={form.control}
                render={({ field }) => (
                  <Switch checked={field.value} onCheckedChange={field.onChange} aria-label="Require location" />
                )}
              />
            </div>

            <Button type="submit" loading={update.isPending}>
              Save settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
