import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const myAttendanceQuerySchema = z.object({
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  status: z.enum(['PRESENT', 'LATE']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class MyAttendanceQueryDto extends createZodDto(myAttendanceQuerySchema) {}

export const adminAttendanceQuerySchema = myAttendanceQuerySchema.extend({
  search: z.string().trim().min(1).optional(),
  department_id: z.coerce.number().int().positive().optional(),
});

export class AdminAttendanceQueryDto extends createZodDto(adminAttendanceQuerySchema) {}
