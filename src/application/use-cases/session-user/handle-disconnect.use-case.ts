import { Inject, Injectable } from '@nestjs/common';
import { ISessionUserRepository } from 'src/core/interfaces/repositories/session-user.repository.interface';
import { ISessionRepository } from 'src/core/interfaces/repositories/session.repository.interface';

@Injectable()
export class HandleDisconnectUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('ISessionUserRepository')
    private readonly sessionUserRepository: ISessionUserRepository,
  ) {}

  async execute(
    userId: string,
    shouldRemove = false,
  ): Promise<{
    sessionId: string | null;
    userId: string;
  }> {
    const session = await this.sessionRepository.findByParticipantId(userId);

    if (!session) {
      return { sessionId: null, userId };
    }

    if (shouldRemove) {
      await this.sessionUserRepository.remove(userId, session.id);
    }

    return {
      sessionId: session.id,
      userId,
    };
  }
}
