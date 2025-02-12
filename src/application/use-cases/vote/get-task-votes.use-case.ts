import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Vote } from '../../../core/entities/vote.entity';
import { ITaskRepository } from '../../../core/interfaces/task.repository.interface';
import { IVoteRepository } from '../../../core/interfaces/vote.repository.interface';

@Injectable()
export class GetTaskVotesUseCase {
  constructor(
    @Inject('IVoteRepository')
    private readonly voteRepository: IVoteRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(taskId: string): Promise<Vote[]> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }

    return this.voteRepository.findByTaskId(taskId);
  }
}
