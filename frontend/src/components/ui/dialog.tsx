'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <DialogPrimitive.Content
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex w-[min(520px,calc(100vw-2rem))] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 flex-col',
          'overflow-hidden rounded-xl border border-border bg-surface-card shadow-lg',
          className,
        )}
        {...props}
      >
        {/* Header and footer are real flex items here, not `position:
         * sticky` inside the scroll area — sticky reserves no space, so
         * trailing content (e.g. the last field in a long form) ends up
         * visually trapped underneath a sticky footer instead of scrolling
         * clear of it. A flex column with `DialogBody` as the only flexible,
         * scrolling child doesn't have that problem structurally. */}
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 z-10 rounded-md p-1 text-ink-muted hover:bg-surface-plane hover:text-ink-primary">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex shrink-0 flex-col gap-1 border-b border-border px-5 py-4', className)}
      {...props}
    />
  );
}

export function DialogTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return <DialogPrimitive.Title className={cn('text-lg font-semibold text-ink-primary', className)} {...props} />;
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return <DialogPrimitive.Description className={cn('text-sm text-ink-secondary', className)} {...props} />;
}

/** The one scrolling region — everything between DialogHeader and
 * DialogFooter goes here. */
export function DialogBody({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('scroll-soft min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4', className)} {...props} />
  );
}

export function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex shrink-0 flex-col-reverse gap-2 border-t border-border px-5 py-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}
