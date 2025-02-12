import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WebSocketEvents } from '../../../application/events/websocket.events';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const error = this.formatError(exception);

    client.emit(WebSocketEvents.ERROR, {
      status: 'error',
      message: error.message,
      event: host.getArgByIndex(1)?.event,
    });
  }

  private formatError(exception: Error) {
    if (exception instanceof WsException) {
      return exception;
    }

    return new WsException(exception.message || 'Internal server error');
  }
}
