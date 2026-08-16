import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Default is "today" and every department — both applied in the service
// when the corresponding field is omitted, not encoded here as a default.
export const dashboardQuerySchema = z.object({
  start_date: z.string().date().optional(),
  end_date: z.string().date().optional(),
  department_id: z.coerce.number().int().positive().optional(),
});

export class DashboardQueryDto extends createZodDto(dashboardQuerySchema) {}
