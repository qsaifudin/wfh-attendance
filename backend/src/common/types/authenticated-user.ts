import { role } from '@prisma/client';

/** Shape attached to `request.user` by JwtAuthGuard once the token is verified. */
export interface AuthenticatedUser {
  user_id: number;
  email: string;
  role: role;
  employee_id: number | null;
}
