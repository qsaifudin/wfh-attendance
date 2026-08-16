import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const createEmployeeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().trim().min(2).max(150),
  position: z.string().trim().min(2).max(150),
  department_id: z.coerce.number().int().positive(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export class CreateEmployeeDto extends createZodDto(createEmployeeSchema) {}
