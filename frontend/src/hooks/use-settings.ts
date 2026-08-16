'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import type { AttendanceSettings } from '@/types/api';
import type { AttendanceSettingsFormValues } from '@/schemas/settings.schema';

export function useAttendanceSettings() {
  return useQuery({
    queryKey: queryKeys.attendanceSettings,
    queryFn: () => unwrap<AttendanceSettings>(api.get('/settings/attendance')),
  });
}

export function useUpdateAttendanceSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: AttendanceSettingsFormValues) =>
      unwrap<AttendanceSettings>(api.patch('/settings/attendance', input)),
    onSuccess: (data) => queryClient.setQueryData(queryKeys.attendanceSettings, data),
  });
}
