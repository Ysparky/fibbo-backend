import { UseGuards } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GetTaskVotesUseCase } from 'src/application/use-cases/vote/get-task-votes.use-case';
import { JoinSessionDto } from '../../application/dto/join-session.dto';
import { SubmitVoteDto } from '../../application/dto/submit-vote.dto';
import { WebSocketEvents } from '../../application/events/websocket.events';
import { JoinSessionUseCase } from '../../application/use-cases/session/join-session.use-case';
import { UpdateSessionUseCase } from '../../application/use-cases/session/update-session.use-case';
import { GetUserVotesUseCase } from '../../application/use-cases/vote/get-user-votes.use-case';
import { SubmitVoteUseCase } from '../../application/use-cases/vote/submit-vote.use-case';
import { UpdateVoteUseCase } from '../../application/use-cases/vote/update-vote.use-case';
import { UserRole } from '../../core/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { WsRolesGuard } from '../auth/guards/ws-roles.guard';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsAuthGuard, WsRolesGuard)
export class SessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly joinSessionUseCase: JoinSessionUseCase,
    private readonly updateSessionUseCase: UpdateSessionUseCase,
    private readonly submitVoteUseCase: SubmitVoteUseCase,
    private readonly getTaskVotesUseCase: GetTaskVotesUseCase,
    private readonly updateVoteUseCase: UpdateVoteUseCase,
    private readonly getUserVotesUseCase: GetUserVotesUseCase,
  ) {}

  async handleConnection(client: Socket) {
    try {
      console.log(`Client connected: ${client.id}`);
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // TODO: Implement user cleanup from session
  }

  @SubscribeMessage(WebSocketEvents.JOIN_SESSION)
  async handleJoinSession(client: Socket, payload: JoinSessionDto) {
    try {
      const participant = await this.joinSessionUseCase.execute({
        sessionId: payload.sessionId,
        participantName: payload.participantName,
      });

      client.join(payload.sessionId);

      this.server.to(payload.sessionId).emit(WebSocketEvents.USER_JOINED, {
        userId: participant.id,
        name: participant.name,
        role: participant.role,
      });

      return { status: 'ok', participant };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage(WebSocketEvents.LEAVE_SESSION)
  async handleLeaveSession(client: Socket, sessionId: string) {
    try {
      client.leave(sessionId);
      this.server.to(sessionId).emit(WebSocketEvents.USER_LEFT, {
        userId: client.data.user.id,
      });
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage(WebSocketEvents.START_VOTING)
  @Roles(UserRole.MODERATOR)
  async handleStartVoting(client: Socket, sessionId: string) {
    try {
      await this.updateSessionUseCase.execute(sessionId, {
        isVotingActive: true,
      });
      this.server.to(sessionId).emit(WebSocketEvents.VOTING_STARTED);
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage(WebSocketEvents.END_VOTING)
  @Roles(UserRole.MODERATOR)
  async handleEndVoting(client: Socket, sessionId: string) {
    try {
      await this.updateSessionUseCase.execute(sessionId, {
        isVotingActive: false,
      });
      this.server.to(sessionId).emit(WebSocketEvents.VOTING_ENDED);
      return { status: 'ok' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage(WebSocketEvents.REVEAL_VOTES)
  @Roles(UserRole.MODERATOR)
  async handleRevealVotes(client: Socket, taskId: string) {
    try {
      const votes = await this.getTaskVotesUseCase.execute(taskId);
      this.server.to(taskId).emit(WebSocketEvents.VOTES_REVEALED, { votes });
      return { status: 'ok', votes };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage(WebSocketEvents.SUBMIT_VOTE)
  async handleSubmitVote(client: Socket, payload: SubmitVoteDto) {
    try {
      const vote = await this.submitVoteUseCase.execute(
        client.data.user.id,
        payload,
      );
      this.server.to(payload.taskId).emit(WebSocketEvents.VOTE_SUBMITTED, {
        userId: client.data.user.id,
        taskId: payload.taskId,
        value: payload.value,
      });
      return { status: 'ok', vote };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage(WebSocketEvents.UPDATE_VOTE)
  async handleUpdateVote(
    client: Socket,
    payload: { voteId: string; value: number },
  ) {
    try {
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
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  @SubscribeMessage(WebSocketEvents.GET_USER_VOTES)
  async handleGetUserVotes(client: Socket, taskId: string) {
    try {
      const votes = await this.getUserVotesUseCase.execute(client.data.user.id);
      return { status: 'ok', votes };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
