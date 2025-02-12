import { Inject, Injectable } from '@nestjs/common';
import { ISessionRepository } from '../../../core/interfaces/repositories/session.repository.interface';

@Injectable()
export class HandleDisconnectUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
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
      await this.sessionRepository.removeParticipantFromAllSessions(userId);
    }

    return {
      sessionId: session.id,
      userId,
    };
  }
}
