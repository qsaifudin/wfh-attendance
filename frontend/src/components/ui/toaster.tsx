'use client';

import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(400px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => {
        const isError = toast.variant === 'error';
        const isSuccess = toast.variant === 'success';

        return (
          <div
            key={toast.id}
            role="status"
            className={cn(
              'flex items-start gap-3 rounded-lg border p-3 text-white shadow-lg transition-all',
              isError && 'border-status-absent bg-status-absent',
              // A dedicated shade, not the --color-status-present token used
              // for badges/text elsewhere — that one measures ~3:1 against
              // white and is fine for small UI marks, but too low for solid
              // white body text. This shade clears ~5.4:1.
              isSuccess && 'border-[#0d7a50] bg-[#0d7a50]',
              !isError && !isSuccess && 'border-border bg-surface-card',
            )}
          >
            {isError && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />}
            {isSuccess && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
            <div className="flex-1">
              <p className={cn('text-sm font-medium', !isError && !isSuccess && 'text-ink-primary')}>
                {toast.title}
              </p>
              {toast.description && (
                <p
                  className={cn(
                    'mt-0.5 text-sm',
                    isError || isSuccess ? 'text-white/90' : 'text-ink-secondary',
                  )}
                >
                  {toast.description}
                </p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className={
                isError || isSuccess ? 'text-white/80 hover:text-white' : 'text-ink-muted hover:text-ink-primary'
              }
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
