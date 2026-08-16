'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

export function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn('relative flex h-5 w-full touch-none select-none items-center', className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow rounded-full bg-surface-plane">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-brand-primary" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full border-2 border-brand-primary bg-white shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent-on-light" />
    </SliderPrimitive.Root>
  );
}
