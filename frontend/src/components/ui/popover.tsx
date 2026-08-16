'use client';

import * as PopoverPrimitive from '@radix-ui/react-popover';
import { cn } from '@/lib/utils';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  className,
  align = 'start',
  sideOffset = 8,
  collisionPadding = 16,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={sideOffset}
        // Radix's collision handling only repositions once content would
        // actually clip past the viewport edge — with the default 0px
        // padding that means it can end up flush against the edge rather
        // than just looking cramped. This keeps a minimum gap.
        collisionPadding={collisionPadding}
        className={cn(
          'z-50 rounded-xl border border-border bg-surface-card p-3 shadow-lg outline-none',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  );
}
