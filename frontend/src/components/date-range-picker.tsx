'use client';

import { useState } from 'react';
import { format, parseISO, startOfMonth, subDays } from 'date-fns';
import type { DateRange as RdpRange } from 'react-day-picker';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface DateRange {
  start_date?: string;
  end_date?: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function toDateString(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

function buildPresets(): { label: string; range: DateRange }[] {
  const today = toDateString(new Date());
  return [
    { label: 'Today', range: { start_date: today, end_date: today } },
    { label: 'Last 7 days', range: { start_date: toDateString(subDays(new Date(), 6)), end_date: today } },
    { label: 'Last 30 days', range: { start_date: toDateString(subDays(new Date(), 29)), end_date: today } },
    { label: 'This month', range: { start_date: toDateString(startOfMonth(new Date())), end_date: today } },
  ];
}

/** Preset rows for the common cases, a calendar popover for everything else
 * — filters are standard UI, not a chart component. */
export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  // Undefined means "follow the selection" — only set once the user
  // actually navigates (arrows or the Today shortcut), so the calendar
  // doesn't fight a value it's supposed to be following.
  const [viewMonth, setViewMonth] = useState<Date | undefined>(undefined);
  const presets = buildPresets();
  const isActive = (range: DateRange) =>
    range.start_date === value.start_date && range.end_date === value.end_date;

  const selected: RdpRange | undefined = value.start_date
    ? {
        from: parseISO(value.start_date),
        to: value.end_date ? parseISO(value.end_date) : undefined,
      }
    : undefined;

  const label = !value.start_date
    ? 'Custom range'
    : value.start_date === value.end_date
      ? format(parseISO(value.start_date), 'd MMM yyyy')
      : `${format(parseISO(value.start_date), 'd MMM')} – ${
          value.end_date ? format(parseISO(value.end_date), 'd MMM yyyy') : '…'
        }`;

  const handleSelect = (range: RdpRange | undefined) => {
    onChange({
      start_date: range?.from ? toDateString(range.from) : undefined,
      end_date: range?.to ? toDateString(range.to) : range?.from ? toDateString(range.from) : undefined,
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            type="button"
            variant={isActive(preset.range) ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => onChange(preset.range)}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant={!value.start_date || presets.some((p) => isActive(p.range)) ? 'secondary' : 'primary'}
            size="sm"
            className="gap-1.5"
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            {label}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="end">
          <Calendar
            mode="range"
            selected={selected}
            onSelect={handleSelect}
            month={viewMonth ?? selected?.from ?? new Date()}
            onMonthChange={setViewMonth}
          />
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const today = new Date();
                  onChange({ start_date: toDateString(today), end_date: toDateString(today) });
                  setViewMonth(today);
                }}
                className="text-sm text-ink-secondary hover:text-ink-primary"
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => onChange({})}
                className={cn('text-sm text-ink-secondary hover:text-ink-primary', !value.start_date && 'invisible')}
              >
                Clear
              </button>
            </div>
            <Button type="button" size="sm" onClick={() => setOpen(false)}>
              Done
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
