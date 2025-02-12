import { CreateSessionUserDto } from 'src/application/dto/session-user/create-session-user.dto';
import { UserRole } from '../../entities/session-user.entity';

export interface ISessionUserRepository {
  getUserRole(userId: string, sessionId: string): Promise<UserRole | null>;
  create(data: CreateSessionUserDto): Promise<void>;
}
