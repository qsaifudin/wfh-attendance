'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker, type DayPickerProps } from 'react-day-picker';
import { cn } from '@/lib/utils';

/** Themed entirely through Tailwind classNames — no default react-day-picker
 * stylesheet is imported, so this reads from the same tokens as the rest of
 * the app in both light and dark mode. */
export function Calendar({ className, classNames, ...props }: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays
      // "around" is the one react-day-picker layout where the prev/next
      // buttons render as siblings of the caption and the grid — not
      // nested inside the caption row — which is what lets them stretch
      // the full height of the calendar via `inset-y-0` below, instead of
      // being confined to the header row's height.
      navLayout="around"
      className={cn('p-2', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-4',
        month: 'relative space-y-3 px-9',
        month_caption: 'flex justify-center items-center h-10',
        caption_label: 'text-sm font-medium text-ink-primary',
        button_previous: cn(
          'absolute inset-y-0 left-0 z-10 flex w-9 items-center justify-center rounded-l-lg transition-colors',
          'text-ink-secondary hover:bg-surface-plane hover:text-ink-primary disabled:opacity-30',
        ),
        button_next: cn(
          'absolute inset-y-0 right-0 z-10 flex w-9 items-center justify-center rounded-r-lg transition-colors',
          'text-ink-secondary hover:bg-surface-plane hover:text-ink-primary disabled:opacity-30',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-ink-muted w-9 text-xs font-medium',
        week: 'flex w-full mt-1',
        day: 'p-0 text-center text-sm relative [&:has([data-selected])]:bg-brand-primary/10',
        day_button: cn(
          'h-9 w-9 rounded-md text-ink-primary font-normal transition-colors',
          'hover:bg-surface-plane focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent-on-light',
        ),
        today: '[&>button]:border [&>button]:border-brand-accent-on-light',
        selected: '[&>button]:bg-brand-primary [&>button]:text-white [&>button]:hover:bg-brand-primary',
        range_start: '[&>button]:bg-brand-primary [&>button]:text-white [&>button]:hover:bg-brand-primary',
        range_end: '[&>button]:bg-brand-primary [&>button]:text-white [&>button]:hover:bg-brand-primary',
        range_middle: '[&>button]:bg-brand-primary/15 [&>button]:text-ink-primary [&>button]:rounded-none',
        outside: '[&>button]:text-ink-muted [&>button]:opacity-50',
        disabled: '[&>button]:text-ink-muted [&>button]:opacity-30 [&>button]:hover:bg-transparent',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
