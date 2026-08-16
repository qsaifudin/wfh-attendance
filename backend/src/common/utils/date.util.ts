import { toZonedTime, format as formatTz } from 'date-fns-tz';

/**
 * All "which calendar day / what time is it" logic for attendance goes
 * through here. Deriving these in UTC instead of the configured timezone
 * misfiles every clock-in after 17:00 WIB into the next day.
 */

/** Returns the work_date (YYYY-MM-DD) for `instant` in `timezone`, as a Date at midnight UTC. */
export function workDateOf(instant: Date, timezone: string): Date {
  const zoned = toZonedTime(instant, timezone);
  const y = zoned.getFullYear();
  const m = zoned.getMonth();
  const d = zoned.getDate();
  return new Date(Date.UTC(y, m, d));
}

/** Returns "HH:mm" for `instant` in `timezone`. */
export function timeOfDay(instant: Date, timezone: string): string {
  return formatTz(instant, 'HH:mm', { timeZone: timezone });
}

/** true for Mon–Fri. */
export function isWorkingDay(date: Date): boolean {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6;
}

/** Count of Mon–Fri days in the inclusive [start, end] range. */
export function countWorkingDays(start: Date, end: Date): number {
  let count = 0;
  const cursor = new Date(
    Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()),
  );
  const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
  while (cursor.getTime() <= last.getTime()) {
    if (isWorkingDay(cursor)) count++;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return count;
}
