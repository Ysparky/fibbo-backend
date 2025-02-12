import { ArgumentsHost, Catch } from '@nestjs/common';
import { BaseWsExceptionFilter, WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WebSocketEvents } from '../../../application/events/websocket.events';
import { DomainException } from '../../../core/exceptions/domain.exception';

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();
    const error = this.formatError(exception);

    client.emit(WebSocketEvents.ERROR, {
      status: 'error',
      message: error.message,
      code: error instanceof DomainException ? error.code : 'INTERNAL_ERROR',
      event: host.getArgByIndex(1)?.event,
    });
  }

  private formatError(exception: Error): Error {
    if (
      exception instanceof DomainException ||
      exception instanceof WsException
    ) {
      return exception;
    }

    return new WsException(exception.message || 'Internal server error');
  }
}
