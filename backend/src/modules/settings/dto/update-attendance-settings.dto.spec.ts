import { updateAttendanceSettingsSchema } from './update-attendance-settings.dto';

describe('updateAttendanceSettingsSchema', () => {
  it.each(['09:30', '00:00', '23:59'])('accepts valid HH:mm value %p', (value) => {
    const result = updateAttendanceSettingsSchema.safeParse({
      late_tolerance_time: value,
      require_location: true,
    });
    expect(result.success).toBe(true);
  });

  it.each(['9:30', '24:00', '09:60', 'not-a-time', ''])('rejects invalid value %p', (value) => {
    const result = updateAttendanceSettingsSchema.safeParse({
      late_tolerance_time: value,
      require_location: true,
    });
    expect(result.success).toBe(false);
  });
});
