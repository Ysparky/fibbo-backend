import { Inject, Injectable } from '@nestjs/common';
import { SessionNotFoundException } from 'src/core/exceptions/session.exception';
import { v4 as uuidv4 } from 'uuid';
import { User, UserRole } from '../../../core/entities/user.entity';
import { ISessionRepository } from '../../../core/interfaces/repositories/session.repository.interface';
import { JoinSessionDto } from '../../dto/join-session.dto';

@Injectable()
export class JoinSessionUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(dto: JoinSessionDto): Promise<User> {
    const session = await this.sessionRepository.findById(dto.sessionId);
    if (!session) {
      throw new SessionNotFoundException(dto.sessionId);
    }

    const participant = new User(
      uuidv4(),
      dto.participantName,
      UserRole.PARTICIPANT,
    );
    await this.sessionRepository.addParticipant(session.id, participant.id);

    return participant;
  }
}
