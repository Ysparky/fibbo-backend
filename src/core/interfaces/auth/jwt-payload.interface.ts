import { UserRole } from '@prisma/client';

export interface JwtPayload {
  id: string;
  name: string;
  role: UserRole;
  sessionId?: string;
}
