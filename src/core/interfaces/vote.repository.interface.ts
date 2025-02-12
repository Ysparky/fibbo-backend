import { Vote } from '../entities/vote.entity';

export interface IVoteRepository {
  create(vote: Vote): Promise<Vote>;
  findById(id: string): Promise<Vote | null>;
  findByTaskId(taskId: string): Promise<Vote[]>;
  findByUserId(userId: string): Promise<Vote[]>;
  update(vote: Vote): Promise<Vote>;
  delete(id: string): Promise<void>;
}
