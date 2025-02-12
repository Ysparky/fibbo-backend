import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Vote } from '../../../core/entities/vote.entity';
import { ITaskRepository } from '../../../core/interfaces/repositories/task.repository.interface';
import { IVoteRepository } from '../../../core/interfaces/repositories/vote.repository.interface';
import { SubmitVoteDto } from '../../dto/submit-vote.dto';

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
      throw new NotFoundException(`Task with ID ${dto.taskId} not found`);
    }

    const vote = new Vote(uuidv4(), dto.taskId, userId, dto.value);
    return this.voteRepository.create(vote);
  }
}
