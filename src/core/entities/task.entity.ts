import { Vote } from './vote.entity';

export class Task {
  id: string;
  title: string;
  description: string;
  sessionId: string;
  finalEstimate?: number;
  votes: Vote[];

  constructor(
    id: string,
    title: string,
    description: string,
    sessionId: string,
  ) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.sessionId = sessionId;
    this.votes = [];
  }
}
