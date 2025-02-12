import { SessionUser } from './session-user.entity';
import { Task } from './task.entity';

export class Session {
  id: string;
  name: string;
  currentTaskId?: string | null;
  isVotingActive: boolean;
  users?: SessionUser[];
  tasks?: Task[];

  constructor(
    id: string,
    name: string,
    currentTaskId: string | null = null,
    isVotingActive = false,
  ) {
    this.id = id;
    this.name = name;
    this.currentTaskId = currentTaskId;
    this.isVotingActive = isVotingActive;
  }
}
