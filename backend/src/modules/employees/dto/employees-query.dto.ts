import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const employeesQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  department_id: z.coerce.number().int().positive().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export class EmployeesQueryDto extends createZodDto(employeesQuerySchema) {}
