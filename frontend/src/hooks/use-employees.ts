'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, unwrapPaginated, unwrap } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import { buildFormData } from '@/lib/form-data';
import type { EmployeeSummary, UserStatus } from '@/types/api';

export interface EmployeesFilter {
  search?: string;
  department_id?: number;
  status?: UserStatus;
  page: number;
  limit: number;
}

export function useEmployees(filter: EmployeesFilter) {
  return useQuery({
    queryKey: queryKeys.employees(filter),
    queryFn: () => unwrapPaginated<EmployeeSummary>(api.get('/employees', { params: filter })),
    placeholderData: (previous) => previous,
  });
}

export function useEmployee(id: number | null) {
  return useQuery({
    queryKey: queryKeys.employee(id ?? -1),
    queryFn: () => unwrap<EmployeeSummary>(api.get(`/employees/${id}`)),
    enabled: id !== null,
  });
}

export interface EmployeeMutationInput {
  full_name?: string;
  position?: string;
  department_id?: number;
  status?: UserStatus;
  email?: string;
  password?: string;
  photo?: Blob | null; // null explicitly means "remove"
}

function toFormData(input: EmployeeMutationInput): FormData {
  const removePhoto = input.photo === null;
  return buildFormData(
    {
      full_name: input.full_name,
      position: input.position,
      department_id: input.department_id,
      status: input.status,
      email: input.email,
      password: input.password,
      remove_photo: removePhoto ? true : undefined,
    },
    input.photo instanceof Blob ? { blob: input.photo, filename: 'photo.jpg' } : null,
  );
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployeeMutationInput) =>
      // No explicit Content-Type — axios detects the FormData body and sets
      // the multipart boundary itself; overriding the header drops it.
      unwrap<EmployeeSummary>(api.post('/employees', toFormData(input))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employees'] }),
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: EmployeeMutationInput & { id: number }) =>
      unwrap<EmployeeSummary>(api.patch(`/employees/${id}`, toFormData(input))),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['employees'] });
      void queryClient.invalidateQueries({ queryKey: queryKeys.employee(variables.id) });
    },
  });
}

/** Self-service — photo only, own record. No id is sent; the backend infers
 * it from the session. */
export function useUpdateMyPhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photo: Blob | null) => unwrap(api.patch('/employees/me', toFormData({ photo }))),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.authMe }),
  });
}
