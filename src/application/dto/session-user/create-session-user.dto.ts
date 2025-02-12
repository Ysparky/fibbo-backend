import { UserRole } from 'src/core/entities/session-user.entity';

export class CreateSessionUserDto {
  userId: string;
  sessionId: string;
  role: UserRole;
}
