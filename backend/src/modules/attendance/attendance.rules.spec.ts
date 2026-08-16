import { evaluateClockIn, isValidLatitude, isValidLongitude } from './attendance.rules';

describe('evaluateClockIn', () => {
  const timezone = 'Asia/Jakarta'; // UTC+7, no DST

  it('marks PRESENT when clocking in before the tolerance', () => {
    // 02:00 UTC = 09:00 WIB
    const result = evaluateClockIn({
      now: new Date('2026-03-10T02:00:00.000Z'),
      timezone,
      settings: { late_tolerance_time: '09:30', require_location: true },
    });
    expect(result.status).toBe('PRESENT');
  });

  it('treats the exact tolerance minute as on time', () => {
    // 02:30 UTC = 09:30 WIB — the tolerance value itself, not past it
    const result = evaluateClockIn({
      now: new Date('2026-03-10T02:30:00.000Z'),
      timezone,
      settings: { late_tolerance_time: '09:30', require_location: true },
    });
    expect(result.status).toBe('PRESENT');
  });

  it('marks LATE the minute after the tolerance', () => {
    // 02:31 UTC = 09:31 WIB
    const result = evaluateClockIn({
      now: new Date('2026-03-10T02:31:00.000Z'),
      timezone,
      settings: { late_tolerance_time: '09:30', require_location: true },
    });
    expect(result.status).toBe('LATE');
  });

  it('respects a different tolerance value', () => {
    const settings = { late_tolerance_time: '08:00', require_location: false };
    const onTime = evaluateClockIn({
      now: new Date('2026-03-10T00:59:00.000Z'),
      timezone,
      settings,
    });
    const late = evaluateClockIn({ now: new Date('2026-03-10T01:01:00.000Z'), timezone, settings });
    expect(onTime.status).toBe('PRESENT');
    expect(late.status).toBe('LATE');
  });

  it('snapshots the tolerance that applied, not a live reference', () => {
    const result = evaluateClockIn({
      now: new Date('2026-03-10T02:00:00.000Z'),
      timezone,
      settings: { late_tolerance_time: '09:30', require_location: true },
    });
    expect(result.applied_late_tolerance_time).toBe('09:30');
  });

  describe('work_date timezone boundary', () => {
    it('rolls over to the next calendar day only after midnight WIB, not UTC', () => {
      // 16:59 UTC on the 9th = 23:59 WIB on the 9th — still the 9th.
      const beforeMidnight = evaluateClockIn({
        now: new Date('2026-03-09T16:59:00.000Z'),
        timezone,
        settings: { late_tolerance_time: '09:30', require_location: true },
      });
      expect(beforeMidnight.work_date.toISOString().slice(0, 10)).toBe('2026-03-09');

      // 17:00 UTC on the 9th = 00:00 WIB on the 10th — a UTC-naive
      // implementation would misfile this into the 9th.
      const afterMidnight = evaluateClockIn({
        now: new Date('2026-03-09T17:00:00.000Z'),
        timezone,
        settings: { late_tolerance_time: '09:30', require_location: true },
      });
      expect(afterMidnight.work_date.toISOString().slice(0, 10)).toBe('2026-03-10');
    });
  });
});

describe('coordinate range checks', () => {
  it.each([
    [0, true],
    [90, true],
    [-90, true],
    [90.1, false],
    [-90.1, false],
  ])('latitude %p -> valid: %p', (value, expected) => {
    expect(isValidLatitude(value)).toBe(expected);
  });

  it.each([
    [0, true],
    [180, true],
    [-180, true],
    [180.1, false],
    [-180.1, false],
  ])('longitude %p -> valid: %p', (value, expected) => {
    expect(isValidLongitude(value)).toBe(expected);
  });
});
