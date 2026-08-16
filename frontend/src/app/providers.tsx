'use client';

import { useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createQueryClient } from '@/lib/query-client';
import { ToastProvider } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        {children}
        <Toaster />
      </ToastProvider>
    </QueryClientProvider>
  );
}
