'use client';

import { useQuery } from '@tanstack/react-query';
import { api, unwrap } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import type { DashboardSummary, TrendPoint } from '@/types/api';

export interface DashboardFilter {
  start_date?: string;
  end_date?: string;
  department_id?: number;
}

export function useDashboardSummary(filter: DashboardFilter) {
  return useQuery({
    queryKey: queryKeys.dashboardSummary(filter),
    queryFn: () => unwrap<DashboardSummary>(api.get('/dashboard/summary', { params: filter })),
  });
}

export function useDashboardTrend(filter: DashboardFilter) {
  return useQuery({
    queryKey: queryKeys.dashboardTrend(filter),
    queryFn: () => unwrap<TrendPoint[]>(api.get('/dashboard/trend', { params: filter })),
  });
}
