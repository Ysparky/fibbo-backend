import { Inject, Injectable } from '@nestjs/common';
import { Vote } from '../../../core/entities/vote.entity';
import { IVoteRepository } from '../../../core/interfaces/repositories/vote.repository.interface';

@Injectable()
export class GetUserVotesUseCase {
  constructor(
    @Inject('IVoteRepository')
    private readonly voteRepository: IVoteRepository,
  ) {}

  async execute(userId: string): Promise<Vote[]> {
    return this.voteRepository.findByUserId(userId);
  }
}
