import { UseFilters, UseGuards } from '@nestjs/common';
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
import { HandleDisconnectUseCase } from '../../application/use-cases/session/handle-disconnect.use-case';
import { HandleReconnectUseCase } from '../../application/use-cases/session/handle-reconnect.use-case';
import { JoinSessionUseCase } from '../../application/use-cases/session/join-session.use-case';
import { UpdateSessionUseCase } from '../../application/use-cases/session/update-session.use-case';
import { GetUserVotesUseCase } from '../../application/use-cases/vote/get-user-votes.use-case';
import { SubmitVoteUseCase } from '../../application/use-cases/vote/submit-vote.use-case';
import { UpdateVoteUseCase } from '../../application/use-cases/vote/update-vote.use-case';
import { UserRole } from '../../core/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { WsRolesGuard } from '../auth/guards/ws-roles.guard';
import { WsCustomException } from './exceptions/ws-custom.exception';
import { WsExceptionFilter } from './filters/ws-exception.filter';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsAuthGuard, WsRolesGuard)
@UseFilters(WsExceptionFilter)
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
    private readonly handleDisconnectUseCase: HandleDisconnectUseCase,
    private readonly handleReconnectUseCase: HandleReconnectUseCase,
  ) {}

  async handleConnection(client: Socket) {
    try {
      console.log(`Client connected: ${client.id}`);

      if (client.data?.user?.id) {
        const sessionId = await this.handleReconnectUseCase.execute(
          client.data.user.id,
        );

        if (sessionId) {
          client.join(sessionId);
          this.server.to(sessionId).emit(WebSocketEvents.USER_JOINED, {
            userId: client.data.user.id,
          });
        }
      }
    } catch (error) {
      console.error('Connection error:', error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    try {
      console.log(`Client disconnected: ${client.id}`);

      if (client.data?.user?.id) {
        const { sessionId, userId } =
          await this.handleDisconnectUseCase.execute(
            client.data.user.id,
            false,
          ); // false = keep in session

        if (sessionId) {
          this.server.to(sessionId).emit(WebSocketEvents.USER_LEFT, {
            userId,
          });

          // Leave all rooms
          client.rooms.forEach((room) => {
            client.leave(room);
          });
        }
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }

  @SubscribeMessage(WebSocketEvents.JOIN_SESSION)
  async handleJoinSession(client: Socket, payload: JoinSessionDto) {
    if (!payload.sessionId || !payload.participantName) {
      throw new WsCustomException('Invalid payload', 'INVALID_PAYLOAD', {
        required: ['sessionId', 'participantName'],
      });
    }

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
  }

  @SubscribeMessage(WebSocketEvents.LEAVE_SESSION)
  async handleLeaveSession(client: Socket, sessionId: string) {
    try {
      await this.handleDisconnectUseCase.execute(client.data.user.id, true); // true = remove from session

      client.leave(sessionId);

      this.server.to(sessionId).emit(WebSocketEvents.USER_LEFT, {
        userId: client.data.user.id,
      });

      return { status: 'ok' };
    } catch (error) {
      throw new WsCustomException(
        'Failed to leave session',
        'LEAVE_SESSION_ERROR',
        { error: error.message },
      );
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
    if (!payload.taskId || typeof payload.value !== 'number') {
      throw new WsCustomException('Invalid payload', 'INVALID_PAYLOAD', {
        required: ['taskId', 'value'],
      });
    }

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
  }

  @SubscribeMessage(WebSocketEvents.UPDATE_VOTE)
  async handleUpdateVote(
    client: Socket,
    payload: { voteId: string; value: number },
  ) {
    if (!payload.voteId || typeof payload.value !== 'number') {
      throw new WsCustomException('Invalid payload', 'INVALID_PAYLOAD', {
        required: ['voteId', 'value'],
      });
    }

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
