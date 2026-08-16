import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const timeFormat = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Must be a 24-hour time in HH:mm format');

export const updateAttendanceSettingsSchema = z.object({
  late_tolerance_time: timeFormat,
  require_location: z.boolean(),
});

export class UpdateAttendanceSettingsDto extends createZodDto(updateAttendanceSettingsSchema) {}
