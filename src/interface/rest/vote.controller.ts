import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { SubmitVoteDto } from '../../application/dto/submit-vote.dto';
import { GetTaskVotesUseCase } from '../../application/use-cases/vote/get-task-votes.use-case';
import { SubmitVoteUseCase } from '../../application/use-cases/vote/submit-vote.use-case';
import { Vote } from '../../core/entities/vote.entity';

@Controller('votes')
export class VoteController {
  constructor(
    private readonly submitVoteUseCase: SubmitVoteUseCase,
    private readonly getTaskVotesUseCase: GetTaskVotesUseCase,
  ) {}

  @Post()
  async submitVote(@Request() req, @Body() dto: SubmitVoteDto): Promise<Vote> {
    // TODO: Get userId from JWT token after implementing authentication
    const userId = req.user?.id || 'temporary-user-id';
    return this.submitVoteUseCase.execute(userId, dto);
  }

  @Get('task/:taskId')
  async getTaskVotes(@Param('taskId') taskId: string): Promise<Vote[]> {
    return this.getTaskVotesUseCase.execute(taskId);
  }
}
