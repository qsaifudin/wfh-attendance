'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrap } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import type { Department } from '@/types/api';
import type { DepartmentFormValues } from '@/schemas/department.schema';

export function useDepartments() {
  return useQuery({
    queryKey: queryKeys.departments,
    queryFn: () => unwrap<Department[]>(api.get('/departments')),
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DepartmentFormValues) => unwrap<Department>(api.post('/departments', input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.departments }),
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: DepartmentFormValues & { id: number }) =>
      unwrap<Department>(api.patch(`/departments/${id}`, input)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.departments }),
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/departments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.departments }),
  });
}
