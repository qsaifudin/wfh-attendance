'use client';

import * as SwitchPrimitive from '@radix-ui/react-switch';
import { cn } from '@/lib/utils';

export function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border transition-colors',
        'data-[state=checked]:bg-brand-primary data-[state=unchecked]:bg-surface-plane',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent-on-light',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        className={cn(
          'block h-5 w-5 rounded-full bg-white shadow transition-transform',
          'data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0.5',
        )}
      />
    </SwitchPrimitive.Root>
  );
}
