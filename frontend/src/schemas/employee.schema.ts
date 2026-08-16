import { z } from 'zod';

export const createEmployeeSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name is required').max(150),
  position: z.string().min(2, 'Position is required').max(150),
  department_id: z.coerce.number({ message: 'Department is required' }).int().positive(),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
});
export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  full_name: z.string().min(2, 'Full name is required').max(150),
  position: z.string().min(2, 'Position is required').max(150),
  department_id: z.coerce.number({ message: 'Department is required' }).int().positive(),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});
export type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeSchema>;
