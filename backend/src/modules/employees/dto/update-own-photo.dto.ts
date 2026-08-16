import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { booleanFromMultipart } from './update-employee.dto';

// Deliberately has no full_name / position / department_id / status field —
// an employee cannot self-reactivate or move department because the DTO
// simply has nowhere to put those values, not because of a runtime check.
export const updateOwnPhotoSchema = z.object({
  remove_photo: booleanFromMultipart.optional(),
});

export class UpdateOwnPhotoDto extends createZodDto(updateOwnPhotoSchema) {}
