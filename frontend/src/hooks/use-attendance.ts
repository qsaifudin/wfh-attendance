'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap, unwrapPaginated } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { buildFormData } from '@/lib/form-data';
import type { AttendanceRecord, AttendanceStatus } from '@/types/api';

export function useMyAttendanceToday() {
  return useQuery({
    queryKey: queryKeys.myAttendanceToday,
    queryFn: () => unwrap<AttendanceRecord | null>(api.get('/attendance/me/today')),
  });
}

export interface AttendanceFilter {
  start_date?: string;
  end_date?: string;
  status?: AttendanceStatus;
  page: number;
  limit: number;
}

export function useMyAttendance(filter: AttendanceFilter) {
  return useQuery({
    queryKey: queryKeys.myAttendance(filter),
    queryFn: () => unwrapPaginated<AttendanceRecord>(api.get('/attendance/me', { params: filter })),
    placeholderData: (previous) => previous,
  });
}

export interface AdminAttendanceFilter extends AttendanceFilter {
  search?: string;
  department_id?: number;
}

export function useAdminAttendance(filter: AdminAttendanceFilter) {
  return useQuery({
    queryKey: queryKeys.adminAttendance(filter),
    queryFn: () => unwrapPaginated<AttendanceRecord>(api.get('/attendance', { params: filter })),
    placeholderData: (previous) => previous,
  });
}

export interface ClockInInput {
  photo: Blob;
  latitude?: number;
  longitude?: number;
  notes?: string;
}

export function useClockIn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ClockInInput) =>
      unwrap<AttendanceRecord>(
        api.post(
          '/attendance/clock-in',
          buildFormData(
            { latitude: input.latitude, longitude: input.longitude, notes: input.notes },
            { blob: input.photo, filename: 'clock-in.jpg' },
          ),
        ),
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.myAttendanceToday });
      void queryClient.invalidateQueries({ queryKey: ['attendance', 'me'] });
    },
  });
}
