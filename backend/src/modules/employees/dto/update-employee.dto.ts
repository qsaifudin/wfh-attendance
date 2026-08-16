import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// z.coerce.boolean() is just Boolean(value), and Boolean("false") === true —
// that would make remove_photo=false silently delete the photo. An explicit
// two-value enum is the only safe way to coerce a multipart boolean.
export const booleanFromMultipart = z.enum(['true', 'false']).transform((v) => v === 'true');

export const updateEmployeeSchema = z.object({
  full_name: z.string().trim().min(2).max(150).optional(),
  position: z.string().trim().min(2).max(150).optional(),
  department_id: z.coerce.number().int().positive().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  remove_photo: booleanFromMultipart.optional(),
});

export class UpdateEmployeeDto extends createZodDto(updateEmployeeSchema) {}
