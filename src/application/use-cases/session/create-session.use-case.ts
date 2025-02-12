import { Inject, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Session } from '../../../core/entities/session.entity';
import { User, UserRole } from '../../../core/entities/user.entity';
import { ISessionRepository } from '../../../core/interfaces/repositories/session.repository.interface';
import { CreateSessionDto } from '../../dto/session/create-session.dto';

@Injectable()
export class CreateSessionUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(dto: CreateSessionDto): Promise<Session> {
    const moderator = new User(uuidv4(), dto.moderatorName, UserRole.MODERATOR);
    const session = new Session(uuidv4(), dto.name, moderator.id);
    session.participants.push(moderator);

    return this.sessionRepository.create(session);
  }
}
