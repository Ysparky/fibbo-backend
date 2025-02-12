import { Inject, Injectable } from '@nestjs/common';
import { SessionNotFoundException } from 'src/core/exceptions/session.exception';
import { Session } from '../../../core/entities/session.entity';
import { ISessionRepository } from '../../../core/interfaces/repositories/session.repository.interface';

@Injectable()
export class GetSessionUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(id: string): Promise<Session> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new SessionNotFoundException(id);
    }
    return session;
  }
}
