import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SubmitVoteDto } from '../../application/dto/vote/submit-vote.dto';
import { UpdateVotePayloadDto } from '../../application/dto/vote/update-vote-payload.dto';
import {
  VoteResponseDto,
  VoteRevealedResponseDto,
  VoteSubmittedResponseDto,
  VoteUpdatedResponseDto,
} from '../../application/dto/vote/vote-response.dto';
import { WebSocketEvents } from '../../application/events/websocket.events';
import { GetTaskVotesUseCase } from '../../application/use-cases/vote/get-task-votes.use-case';
import { SubmitVoteUseCase } from '../../application/use-cases/vote/submit-vote.use-case';
import { UpdateVoteUseCase } from '../../application/use-cases/vote/update-vote.use-case';
import { UserRole } from '../../core/entities/session-user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { WsRolesGuard } from '../auth/guards/ws-roles.guard';
import { WsExceptionFilter } from './filters/ws-exception.filter';
import { WsValidationPipe } from './pipes/ws-validation.pipe';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsAuthGuard, WsRolesGuard)
@UseFilters(WsExceptionFilter)
@UsePipes(new WsValidationPipe())
export class VoteGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly submitVoteUseCase: SubmitVoteUseCase,
    private readonly updateVoteUseCase: UpdateVoteUseCase,
    private readonly getTaskVotesUseCase: GetTaskVotesUseCase,
  ) {}

  @SubscribeMessage(WebSocketEvents.SUBMIT_VOTE)
  async handleSubmitVote(
    client: Socket,
    payload: SubmitVoteDto,
  ): Promise<VoteResponseDto> {
    const vote = await this.submitVoteUseCase.execute(
      client.data.user.id,
      payload,
    );

    const response: VoteSubmittedResponseDto = {
      status: 'ok',
      userId: client.data.user.id,
      taskId: payload.taskId,
      value: payload.value,
    };

    this.server
      .to(payload.taskId)
      .emit(WebSocketEvents.VOTE_SUBMITTED, response);

    return {
      status: 'ok',
      vote,
    };
  }

  @SubscribeMessage(WebSocketEvents.UPDATE_VOTE)
  async handleUpdateVote(
    client: Socket,
    payload: UpdateVotePayloadDto,
  ): Promise<VoteUpdatedResponseDto> {
    const vote = await this.updateVoteUseCase.execute(
      payload.voteId,
      client.data.user.id,
      { value: payload.value },
    );

    this.server.to(vote.taskId).emit(WebSocketEvents.VOTE_UPDATED, {
      voteId: vote.id,
      userId: vote.userId,
      value: vote.value,
    });

    return { status: 'ok', vote };
  }

  @SubscribeMessage(WebSocketEvents.REVEAL_VOTES)
  @Roles(UserRole.MODERATOR)
  async handleRevealVotes(
    client: Socket,
    taskId: string,
  ): Promise<VoteRevealedResponseDto> {
    const votes = await this.getTaskVotesUseCase.execute(taskId);
    this.server.to(taskId).emit(WebSocketEvents.VOTES_REVEALED, { votes });
    return { status: 'ok', votes };
  }
}
