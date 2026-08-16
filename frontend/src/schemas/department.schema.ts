import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
});
export type DepartmentFormValues = z.infer<typeof departmentSchema>;
