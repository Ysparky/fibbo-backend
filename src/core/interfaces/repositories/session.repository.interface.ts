import { CreateSessionDto } from 'src/application/dto/session/create-session.dto';
import { Session } from '../../entities/session.entity';

export interface ISessionRepository {
  create(data: CreateSessionDto): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  update(id: string, data: Partial<Session>): Promise<Session>;
  delete(id: string): Promise<void>;
  findByParticipantId(userId: string): Promise<Session | null>;
}
