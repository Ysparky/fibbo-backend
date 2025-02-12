import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinSessionDto } from '../../application/dto/session/join-session.dto';
import {
  WsJoinSessionResponseDto,
  WsLeaveSessionResponseDto,
  WsVotingStateResponseDto,
} from '../../application/dto/session/session-response.dto';
import { WebSocketEvents } from '../../application/events/websocket.events';
import { HandleDisconnectUseCase } from '../../application/use-cases/session/handle-disconnect.use-case';
import { HandleReconnectUseCase } from '../../application/use-cases/session/handle-reconnect.use-case';
import { JoinSessionUseCase } from '../../application/use-cases/session/join-session.use-case';
import { UpdateSessionUseCase } from '../../application/use-cases/session/update-session.use-case';
import { UserRole } from '../../core/entities/session-user.entity';
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
          );

        if (sessionId) {
          this.server.to(sessionId).emit(WebSocketEvents.USER_LEFT, {
            userId,
          });

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
      await this.handleDisconnectUseCase.execute(client.data.user.id, true);

      client.leave(sessionId);

      this.server.to(sessionId).emit(WebSocketEvents.USER_LEFT, {
        userId: client.data.user.id,
      });

      return { status: 'ok' };
    } catch (error) {
      throw new WsCustomException(
        'Failed to leave session',
        'LEAVE_SESSION_ERROR',
        {
          error: error.message,
        },
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
}
