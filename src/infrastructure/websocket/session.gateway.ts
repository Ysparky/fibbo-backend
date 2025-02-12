import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JoinSessionDto } from '../../application/dto/join-session.dto';
import { SubmitVoteDto } from '../../application/dto/submit-vote.dto';
import { WebSocketEvents } from '../../application/events/websocket.events';
import { JoinSessionUseCase } from '../../application/use-cases/session/join-session.use-case';
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class SessionGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(private readonly joinSessionUseCase: JoinSessionUseCase) {}

  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
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

  @SubscribeMessage(WebSocketEvents.SUBMIT_VOTE)
  async handleSubmitVote(client: Socket, payload: SubmitVoteDto) {
    try {
      // Implementation for vote submission
      this.server.to(payload.taskId).emit(WebSocketEvents.VOTE_SUBMITTED, {
        taskId: payload.taskId,
        value: payload.value,
      });

      return { status: 'ok' };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}
