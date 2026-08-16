import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

// Multipart form fields arrive as strings, so latitude/longitude need coercion.
export const clockInSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90).optional(),
  longitude: z.coerce.number().min(-180).max(180).optional(),
  notes: z.string().trim().max(500).optional(),
});

export class ClockInDto extends createZodDto(clockInSchema) {}
