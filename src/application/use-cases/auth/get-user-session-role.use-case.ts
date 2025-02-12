import { Inject, Injectable } from '@nestjs/common';
import { UserRole } from 'src/core/entities/session-user.entity';
import { ISessionUserRepository } from 'src/core/interfaces/repositories/session-user.repository.interface';

@Injectable()
export class GetUserSessionRoleUseCase {
  constructor(
    @Inject('ISessionUserRepository')
    private sessionUserRepository: ISessionUserRepository,
  ) {}

  async execute(userId: string, sessionId: string): Promise<UserRole | null> {
    return this.sessionUserRepository.getUserRole(userId, sessionId);
  }
}
