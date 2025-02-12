import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Session } from '../../../core/entities/session.entity';
import { ISessionRepository } from '../../../core/interfaces/session.repository.interface';
import { UpdateSessionDto } from '../../dto/update-session.dto';

@Injectable()
export class UpdateSessionUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(id: string, dto: UpdateSessionDto): Promise<Session> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    session.name = dto.name ?? session.name;
    session.currentTaskId = dto.currentTaskId ?? session.currentTaskId;
    session.isVotingActive = dto.isVotingActive ?? session.isVotingActive;

    return this.sessionRepository.update(session);
  }
}
