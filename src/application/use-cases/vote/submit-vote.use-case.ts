import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Vote } from '../../../core/entities/vote.entity';
import { TaskNotFoundException } from '../../../core/exceptions/task.exception';
import { VoteOperationException } from '../../../core/exceptions/vote.exception';
import { ITaskRepository } from '../../../core/interfaces/repositories/task.repository.interface';
import { IVoteRepository } from '../../../core/interfaces/repositories/vote.repository.interface';
import { SubmitVoteDto } from '../../dto/vote/submit-vote.dto';

@Injectable()
export class SubmitVoteUseCase {
  constructor(
    @Inject('IVoteRepository')
    private readonly voteRepository: IVoteRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(userId: string, dto: SubmitVoteDto): Promise<Vote> {
    const task = await this.taskRepository.findById(dto.taskId);
    if (!task) {
      throw new TaskNotFoundException(dto.taskId);
    }

    const existingVote = await this.voteRepository.findByUserAndTask(
      userId,
      dto.taskId,
    );
    if (existingVote) {
      throw new VoteOperationException('User has already voted for this task');
    }

    return this.voteRepository.create({
      id: uuidv4(),
      userId,
      taskId: dto.taskId,
      value: dto.value,
      timestamp: new Date(),
    });
  }
}
