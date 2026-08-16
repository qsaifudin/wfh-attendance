import { countWorkingDays, isWorkingDay, timeOfDay, workDateOf } from './date.util';

describe('workDateOf', () => {
  it('derives the work date in the given timezone, not UTC', () => {
    // 20:00 UTC = 03:00 WIB the next day
    const date = workDateOf(new Date('2026-06-01T20:00:00.000Z'), 'Asia/Jakarta');
    expect(date.toISOString().slice(0, 10)).toBe('2026-06-02');
  });
});

describe('timeOfDay', () => {
  it('formats as HH:mm in the given timezone', () => {
    expect(timeOfDay(new Date('2026-06-01T02:15:00.000Z'), 'Asia/Jakarta')).toBe('09:15');
  });
});

describe('isWorkingDay', () => {
  it('excludes Saturday and Sunday', () => {
    expect(isWorkingDay(new Date('2026-06-06T00:00:00.000Z'))).toBe(false); // Saturday
    expect(isWorkingDay(new Date('2026-06-07T00:00:00.000Z'))).toBe(false); // Sunday
    expect(isWorkingDay(new Date('2026-06-08T00:00:00.000Z'))).toBe(true); // Monday
  });
});

describe('countWorkingDays', () => {
  it('counts Mon–Fri across a full week as 5', () => {
    const start = new Date('2026-06-01T00:00:00.000Z'); // Monday
    const end = new Date('2026-06-07T00:00:00.000Z'); // Sunday
    expect(countWorkingDays(start, end)).toBe(5);
  });

  it('counts a single weekday as 1 and a single weekend day as 0', () => {
    expect(
      countWorkingDays(new Date('2026-06-08T00:00:00.000Z'), new Date('2026-06-08T00:00:00.000Z')),
    ).toBe(1);
    expect(
      countWorkingDays(new Date('2026-06-06T00:00:00.000Z'), new Date('2026-06-06T00:00:00.000Z')),
    ).toBe(0);
  });
});
