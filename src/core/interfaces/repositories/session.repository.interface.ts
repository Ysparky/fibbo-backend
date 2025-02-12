import { Session } from '../../entities/session.entity';

export interface ISessionRepository {
  create(session: Session): Promise<Session>;
  findById(id: string): Promise<Session | null>;
  update(session: Session): Promise<Session>;
  delete(id: string): Promise<void>;
  addParticipant(sessionId: string, userId: string): Promise<Session>;
  removeParticipant(sessionId: string, userId: string): Promise<Session>;
}
