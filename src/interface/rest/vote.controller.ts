import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { SubmitVoteDto } from '../../application/dto/submit-vote.dto';
import { GetTaskVotesUseCase } from '../../application/use-cases/vote/get-task-votes.use-case';
import { SubmitVoteUseCase } from '../../application/use-cases/vote/submit-vote.use-case';
import { Vote } from '../../core/entities/vote.entity';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';

@Controller('votes')
@UseGuards(JwtAuthGuard)
export class VoteController {
  constructor(
    private readonly submitVoteUseCase: SubmitVoteUseCase,
    private readonly getTaskVotesUseCase: GetTaskVotesUseCase,
  ) {}

  @Post()
  async submitVote(@Request() req, @Body() dto: SubmitVoteDto): Promise<Vote> {
    return this.submitVoteUseCase.execute(req.user.id, dto);
  }

  @Get('task/:taskId')
  async getTaskVotes(@Param('taskId') taskId: string): Promise<Vote[]> {
    return this.getTaskVotesUseCase.execute(taskId);
  }
}
