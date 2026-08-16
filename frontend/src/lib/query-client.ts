import { QueryClient } from '@tanstack/react-query';

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

// Central place so realtime invalidation and page-level queries never drift.
export const queryKeys = {
  authMe: ['auth', 'me'] as const,
  departments: ['departments'] as const,
  employees: (params: unknown) => ['employees', params] as const,
  employee: (id: number) => ['employees', id] as const,
  attendanceSettings: ['settings', 'attendance'] as const,
  myAttendanceToday: ['attendance', 'me', 'today'] as const,
  myAttendance: (params: unknown) => ['attendance', 'me', params] as const,
  adminAttendance: (params: unknown) => ['attendance', 'admin', params] as const,
  dashboardSummary: (params: unknown) => ['dashboard', 'summary', params] as const,
  dashboardTrend: (params: unknown) => ['dashboard', 'trend', params] as const,
};
