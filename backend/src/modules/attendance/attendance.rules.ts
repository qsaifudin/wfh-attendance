import { timeOfDay, workDateOf } from '../../common/utils/date.util';

/**
 * Pure business rules for clock-in — no Prisma, no HTTP, no I/O. Settings
 * are always passed in as an argument rather than read from the database
 * here, which is what keeps this module trivial to sweep with tests.
 */

export interface AttendanceSettingsInput {
  late_tolerance_time: string; // "HH:mm" — the last minute that still counts as on time
  require_location: boolean;
}

export interface EvaluateClockInParams {
  now: Date;
  timezone: string;
  settings: AttendanceSettingsInput;
}

export interface ClockInEvaluation {
  work_date: Date;
  status: 'PRESENT' | 'LATE';
  applied_late_tolerance_time: string;
}

export function evaluateClockIn({
  now,
  timezone,
  settings,
}: EvaluateClockInParams): ClockInEvaluation {
  const work_date = workDateOf(now, timezone);
  const time = timeOfDay(now, timezone);
  // "HH:mm" strings compare correctly as plain strings — clocking in AT the
  // tolerance minute is still on time, so this is strictly-greater-than.
  const status = time > settings.late_tolerance_time ? 'LATE' : 'PRESENT';
  return { work_date, status, applied_late_tolerance_time: settings.late_tolerance_time };
}

export function isValidLatitude(value: number): boolean {
  return value >= -90 && value <= 90;
}

export function isValidLongitude(value: number): boolean {
  return value >= -180 && value <= 180;
}
