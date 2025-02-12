import { Task } from './task.entity';
import { User } from './user.entity';

export class Session {
  id: string;
  name: string;
  moderatorId: string;
  tasks: Task[];
  participants: User[];
  currentTaskId?: string;
  isVotingActive: boolean;

  constructor(id: string, name: string, moderatorId: string) {
    this.id = id;
    this.name = name;
    this.moderatorId = moderatorId;
    this.tasks = [];
    this.participants = [];
    this.isVotingActive = false;
  }
}
