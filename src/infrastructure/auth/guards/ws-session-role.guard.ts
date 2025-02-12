import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { GetUserSessionRoleUseCase } from 'src/application/use-cases/auth/get-user-session-role.use-case';
import { UserRole } from '../../../core/entities/session-user.entity';

@Injectable()
export class WsSessionRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly getUserSessionRoleUseCase: GetUserSessionRoleUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    const user = client.data.user;
    const [sessionId] = context.getArgs().slice(1); // Get sessionId from the second argument

    if (!user?.id || !sessionId) {
      throw new WsException('Unauthorized');
    }

    const userRole = await this.getUserSessionRoleUseCase.execute(
      user.id,
      sessionId,
    );

    if (!userRole) {
      throw new WsException('User not in session');
    }

    const hasRole = requiredRoles.includes(userRole);
    if (!hasRole) {
      throw new WsException('Insufficient permissions');
    }

    return true;
  }
}
