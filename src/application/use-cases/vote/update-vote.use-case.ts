import { Inject, Injectable } from '@nestjs/common';
import {
  VoteAccessDeniedException,
  VoteNotFoundException,
} from 'src/core/exceptions/vote.exception';
import { Vote } from '../../../core/entities/vote.entity';
import { IVoteRepository } from '../../../core/interfaces/repositories/vote.repository.interface';
import { UpdateVoteDto } from '../../dto/update-vote.dto';

@Injectable()
export class UpdateVoteUseCase {
  constructor(
    @Inject('IVoteRepository')
    private readonly voteRepository: IVoteRepository,
  ) {}

  async execute(id: string, userId: string, dto: UpdateVoteDto): Promise<Vote> {
    const vote = await this.voteRepository.findById(id);
    if (!vote) {
      throw new VoteNotFoundException(id);
    }

    if (vote.userId !== userId) {
      throw new VoteAccessDeniedException();
    }

    vote.value = dto.value;
    vote.timestamp = new Date();

    return this.voteRepository.update(vote);
  }
}
