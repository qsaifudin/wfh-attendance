'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export const Tabs = TabsPrimitive.Root;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn('inline-flex items-center gap-1 rounded-lg border border-border bg-surface-plane p-1', className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-medium text-ink-secondary transition-colors',
        'data-[state=active]:bg-surface-card data-[state=active]:text-ink-primary data-[state=active]:shadow-sm',
        className,
      )}
      {...props}
    />
  );
}

export function TabsContent(props: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return <TabsPrimitive.Content {...props} />;
}
