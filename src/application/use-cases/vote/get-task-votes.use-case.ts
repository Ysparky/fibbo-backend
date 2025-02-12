import { Inject, Injectable } from '@nestjs/common';
import { TaskNotFoundException } from 'src/core/exceptions/task.exception';
import { Vote } from '../../../core/entities/vote.entity';
import { ITaskRepository } from '../../../core/interfaces/repositories/task.repository.interface';
import { IVoteRepository } from '../../../core/interfaces/repositories/vote.repository.interface';

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
      throw new TaskNotFoundException(taskId);
    }

    return this.voteRepository.findByTaskId(taskId);
  }
}
