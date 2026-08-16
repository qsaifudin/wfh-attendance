'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { useToast } from '@/hooks/use-toast';
import type { AttendanceRecord } from '@/types/api';

/** Subscribes the admin session to attendance:created. On event we
 * invalidate rather than patch the cache — a refetch respects whatever
 * filters are currently active on the page, which surgical cache
 * patching would get wrong. */
export function useRealtimeAttendance(enabled: boolean) {
  const queryClient = useQueryClient();
  const { push } = useToast();

  useEffect(() => {
    if (!enabled) return;

    const socket = getSocket();
    socket.connect();

    const onCreated = (record: AttendanceRecord) => {
      void queryClient.invalidateQueries({ queryKey: ['attendance'] });
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      push({
        title: 'New clock-in',
        description: `${record.employee.full_name} just clocked in (${record.status.toLowerCase()}).`,
        variant: 'success',
      });
    };

    socket.on('attendance:created', onCreated);

    return () => {
      socket.off('attendance:created', onCreated);
      socket.disconnect();
    };
  }, [enabled, queryClient, push]);
}
