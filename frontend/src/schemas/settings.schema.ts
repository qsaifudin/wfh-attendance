import { z } from 'zod';

export const attendanceSettingsSchema = z.object({
  late_tolerance_time: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be a 24-hour time in HH:mm format'),
  require_location: z.boolean(),
});
export type AttendanceSettingsFormValues = z.infer<typeof attendanceSettingsSchema>;
