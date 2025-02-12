import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Session } from '../../../core/entities/session.entity';
import { ISessionRepository } from '../../../core/interfaces/session.repository.interface';

@Injectable()
export class GetSessionUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(id: string): Promise<Session> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }
    return session;
  }
}
