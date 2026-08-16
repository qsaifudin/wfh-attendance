'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { api, unwrap } from '@/lib/api';
import { queryKeys } from '@/lib/query-client';
import type { AuthUser } from '@/types/api';

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.authMe,
    queryFn: () => unwrap<AuthUser>(api.get('/auth/me')),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      unwrap<AuthUser>(api.post('/auth/login', input)),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.authMe, user);
      router.push(user.role === 'ADMIN' ? '/admin' : '/dashboard');
      router.refresh();
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => api.post('/auth/logout'),
    onSuccess: () => {
      queryClient.clear();
      router.push('/login');
      router.refresh();
    },
  });
}
