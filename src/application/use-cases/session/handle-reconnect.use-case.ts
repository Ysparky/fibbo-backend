import { Inject, Injectable } from '@nestjs/common';
import { ISessionRepository } from '../../../core/interfaces/repositories/session.repository.interface';

@Injectable()
export class HandleReconnectUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(userId: string): Promise<string | null> {
    const session = await this.sessionRepository.findByParticipantId(userId);
    return session?.id || null;
  }
}
