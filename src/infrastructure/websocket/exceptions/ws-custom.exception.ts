import { WsException } from '@nestjs/websockets';

export class WsCustomException extends WsException {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: any,
  ) {
    super({ message, code, details });
  }
}
