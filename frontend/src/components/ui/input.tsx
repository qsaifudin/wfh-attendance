import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-10 w-full rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-ink-primary',
        'placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent-on-light',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';
