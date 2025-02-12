import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GetUserSessionRoleUseCase } from 'src/application/use-cases/auth/get-user-session-role.use-case';
import { UserRole } from '../../../core/entities/session-user.entity';

@Injectable()
export class SessionRoleGuard implements CanActivate {
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

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const sessionId = request.params.sessionId || request.body.sessionId;

    if (!user || !sessionId) {
      return false;
    }

    const userRole = await this.getUserSessionRoleUseCase.execute(
      user.id,
      sessionId,
    );

    if (!userRole) {
      return false;
    }

    return requiredRoles.includes(userRole);
  }
}
