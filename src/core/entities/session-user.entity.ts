import { Session } from './session.entity';
import { User } from './user.entity';

export class SessionUser {
  userId: string;
  sessionId: string;
  role: UserRole;
  user?: User;
  session?: Session;
}

export enum UserRole {
  MODERATOR = 'MODERATOR',
  PARTICIPANT = 'PARTICIPANT',
}
