import {
  NotFoundException,
  UseFilters,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GetTaskVotesUseCase } from 'src/application/use-cases/vote/get-task-votes.use-case';
import { JoinSessionDto } from '../../application/dto/session/join-session.dto';
import {
  WsJoinSessionResponseDto,
  WsLeaveSessionResponseDto,
  WsVotingStateResponseDto,
} from '../../application/dto/session/session-response.dto';
import { ChangeCurrentTaskPayloadDto } from '../../application/dto/task/change-current-task-payload.dto';
import { CreateTaskDto } from '../../application/dto/task/create-task.dto';
import { DeleteTaskPayloadDto } from '../../application/dto/task/delete-task-payload.dto';
import {
  CurrentTaskChangedResponseDto,
  TaskDeletedResponseDto,
  TaskResponseDto,
  TaskUpdatedResponseDto,
} from '../../application/dto/task/task-response.dto';
import { UpdateTaskPayloadDto } from '../../application/dto/task/update-task-payload.dto';
import { SubmitVoteDto } from '../../application/dto/vote/submit-vote.dto';
import { UpdateVotePayloadDto } from '../../application/dto/vote/update-vote-payload.dto';
import {
  VoteResponseDto,
  VoteRevealedResponseDto,
  VoteSubmittedResponseDto,
  VoteUpdatedResponseDto,
} from '../../application/dto/vote/vote-response.dto';
import { WebSocketEvents } from '../../application/events/websocket.events';
import { HandleDisconnectUseCase } from '../../application/use-cases/session/handle-disconnect.use-case';
import { HandleReconnectUseCase } from '../../application/use-cases/session/handle-reconnect.use-case';
import { JoinSessionUseCase } from '../../application/use-cases/session/join-session.use-case';
import { UpdateSessionUseCase } from '../../application/use-cases/session/update-session.use-case';
import { ChangeCurrentTaskUseCase } from '../../application/use-cases/task/change-current-task.use-case';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/task/delete-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task.use-case';
import { SubmitVoteUseCase } from '../../application/use-cases/vote/submit-vote.use-case';
import { UpdateVoteUseCase } from '../../application/use-cases/vote/update-vote.use-case';
import { UserRole } from '../../core/entities/user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { WsRolesGuard } from '../auth/guards/ws-roles.guard';
import { WsCustomException } from './exceptions/ws-custom.exception';
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
    private readonly handleDisconnectUseCase: HandleDisconnectUseCase,
    private readonly handleReconnectUseCase: HandleReconnectUseCase,
    private readonly changeCurrentTaskUseCase: ChangeCurrentTaskUseCase,
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
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
  async handleJoinSession(
    client: Socket,
    payload: JoinSessionDto,
  ): Promise<WsJoinSessionResponseDto> {
    const participant = await this.joinSessionUseCase.execute(payload);

    client.join(payload.sessionId);

    this.server.to(payload.sessionId).emit(WebSocketEvents.USER_JOINED, {
      userId: participant.id,
      name: participant.name,
      role: participant.role,
    });

    return {
      status: 'ok',
      participant: {
        id: participant.id,
        name: participant.name,
        role: participant.role,
      },
    };
  }

  @SubscribeMessage(WebSocketEvents.LEAVE_SESSION)
  async handleLeaveSession(
    client: Socket,
    sessionId: string,
  ): Promise<WsLeaveSessionResponseDto> {
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
  async handleStartVoting(
    client: Socket,
    sessionId: string,
  ): Promise<WsVotingStateResponseDto> {
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
  async handleEndVoting(
    client: Socket,
    sessionId: string,
  ): Promise<WsVotingStateResponseDto> {
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
  async handleRevealVotes(
    client: Socket,
    taskId: string,
  ): Promise<VoteRevealedResponseDto> {
    try {
      const votes = await this.getTaskVotesUseCase.execute(taskId);
      this.server.to(taskId).emit(WebSocketEvents.VOTES_REVEALED, { votes });
      return { status: 'ok', votes };
    } catch (error) {
      return { status: 'error', message: error.message, votes: [] };
    }
  }

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

  @SubscribeMessage(WebSocketEvents.TASK_CREATED)
  @Roles(UserRole.MODERATOR)
  async handleTaskCreated(
    client: Socket,
    payload: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.createTaskUseCase.execute(payload);

    const response: TaskResponseDto = {
      status: 'ok',
      task,
    };

    this.server
      .to(payload.sessionId)
      .emit(WebSocketEvents.TASK_CREATED, response);

    return response;
  }

  @SubscribeMessage(WebSocketEvents.TASK_UPDATED)
  @Roles(UserRole.MODERATOR)
  async handleTaskUpdated(
    client: Socket,
    payload: UpdateTaskPayloadDto,
  ): Promise<TaskUpdatedResponseDto> {
    const task = await this.updateTaskUseCase.execute(
      payload.taskId,
      payload.update,
    );

    const response: TaskUpdatedResponseDto = {
      status: 'ok',
      task,
    };

    this.server.to(task.sessionId).emit(WebSocketEvents.TASK_UPDATED, response);

    return response;
  }

  @SubscribeMessage(WebSocketEvents.TASK_DELETED)
  @Roles(UserRole.MODERATOR)
  async handleTaskDeleted(
    client: Socket,
    payload: DeleteTaskPayloadDto,
  ): Promise<TaskDeletedResponseDto> {
    try {
      await this.deleteTaskUseCase.execute(payload.taskId);

      const sessionId = Array.from(client.rooms).find(
        (room) => room !== client.id,
      );
      if (!sessionId) {
        throw new WsCustomException('Client not in any session', 'NO_SESSION');
      }

      const response: TaskDeletedResponseDto = {
        status: 'ok',
        taskId: payload.taskId,
      };

      this.server.to(sessionId).emit(WebSocketEvents.TASK_DELETED, response);

      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new WsCustomException('Task not found', 'TASK_NOT_FOUND');
      }
      throw error;
    }
  }

  @SubscribeMessage(WebSocketEvents.CURRENT_TASK_CHANGED)
  @Roles(UserRole.MODERATOR)
  async handleCurrentTaskChanged(
    client: Socket,
    payload: ChangeCurrentTaskPayloadDto,
  ): Promise<CurrentTaskChangedResponseDto> {
    await this.changeCurrentTaskUseCase.execute(
      payload.sessionId,
      payload.taskId,
    );

    const response: CurrentTaskChangedResponseDto = {
      status: 'ok',
      taskId: payload.taskId,
    };

    this.server
      .to(payload.sessionId)
      .emit(WebSocketEvents.CURRENT_TASK_CHANGED, response);

    return response;
  }
}
