'use client';

import { Clock } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

interface TimePickerProps {
  value: string; // "HH:mm"
  onChange: (value: string) => void;
  disabled?: boolean;
}

/** Two plain dropdowns instead of the native `<input type="time">` — the
 * native control's popup can't be themed (it renders as an unstyled system
 * widget regardless of the page's design) and looks visually disconnected
 * from the rest of the form. */
export function TimePicker({ value, onChange, disabled }: TimePickerProps) {
  // Defensive: a form field can render one tick before its default value
  // arrives (e.g. useForm() with no defaultValues, reset() firing in an
  // effect after first paint) — falling back instead of crashing on
  // `undefined.split(...)` covers that gap regardless of the caller.
  const [hour, minute] = (value || '00:00').split(':');

  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-ink-muted" />
      <Select value={hour} onValueChange={(h) => onChange(`${h}:${minute}`)} disabled={disabled}>
        <SelectTrigger className="w-[4.5rem]">
          {/* Explicit children, not the bare auto-lookup <SelectValue />:
           * Radix only learns a value's display label once its SelectItem
           * has actually mounted (normally on first open), so a value set
           * before the dropdown was ever opened — e.g. right after a page
           * load — can render blank even though it's perfectly valid. We
           * already know the label is just the value itself, so there's no
           * lookup to depend on. */}
          <SelectValue>{hour}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-ink-muted">:</span>
      <Select value={minute} onValueChange={(m) => onChange(`${hour}:${m}`)} disabled={disabled}>
        <SelectTrigger className="w-[4.5rem]">
          <SelectValue>{minute}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {MINUTES.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
