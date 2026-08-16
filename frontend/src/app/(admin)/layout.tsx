'use client';

import { AppShell } from '@/components/app-shell';
import { useRealtimeAttendance } from '@/hooks/use-realtime';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  useRealtimeAttendance(true);
  return <AppShell>{children}</AppShell>;
}
