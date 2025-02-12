import { UserRole } from '../../entities/session-user.entity';

export interface ISessionUserRepository {
  getUserRole(userId: string, sessionId: string): Promise<UserRole | null>;
}
