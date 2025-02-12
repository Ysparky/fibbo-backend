import { Inject, Injectable } from '@nestjs/common';
import { SessionNotFoundException } from 'src/core/exceptions/session.exception';
import { Session } from '../../../core/entities/session.entity';
import { ISessionRepository } from '../../../core/interfaces/repositories/session.repository.interface';
import { UpdateSessionDto } from '../../dto/session/update-session.dto';

@Injectable()
export class UpdateSessionUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(id: string, dto: UpdateSessionDto): Promise<Session> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new SessionNotFoundException(id);
    }

    session.name = dto.name ?? session.name;
    session.currentTaskId = dto.currentTaskId ?? session.currentTaskId;
    session.isVotingActive = dto.isVotingActive ?? session.isVotingActive;

    return this.sessionRepository.update(session);
  }
}
