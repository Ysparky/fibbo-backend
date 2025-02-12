import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { UserRole } from '../../../core/entities/user.entity';

@Injectable()
export class WsRolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true;
    }

    const client: Socket = context.switchToWs().getClient();
    const user = client.data.user;

    if (!user || !user.role) {
      throw new WsException('Unauthorized');
    }

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) {
      throw new WsException('Insufficient permissions');
    }

    return true;
  }
}
