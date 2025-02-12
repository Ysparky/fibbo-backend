import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { IAuthService } from '../../../core/interfaces/auth/auth.interface';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient();
    const token = this.extractTokenFromHeader(client);

    if (!token) {
      throw new WsException('Unauthorized');
    }

    try {
      const isValid = await this.authService.validateToken(token);
      if (!isValid) {
        throw new WsException('Unauthorized');
      }
      return true;
    } catch {
      throw new WsException('Unauthorized');
    }
  }

  private extractTokenFromHeader(client: Socket): string | undefined {
    const auth = client.handshake.headers.authorization;
    const [type, token] = auth?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
