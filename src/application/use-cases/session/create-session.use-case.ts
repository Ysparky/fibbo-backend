import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Session } from '../../../core/entities/session.entity';
import { User, UserRole } from '../../../core/entities/user.entity';
import { ISessionRepository } from '../../../core/interfaces/session.repository.interface';
import { CreateSessionDto } from '../../dto/create-session.dto';

@Injectable()
export class CreateSessionUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  async execute(dto: CreateSessionDto): Promise<Session> {
    const moderator = new User(uuidv4(), dto.moderatorName, UserRole.MODERATOR);
    const session = new Session(uuidv4(), dto.name, moderator.id);
    session.participants.push(moderator);

    return this.sessionRepository.create(session);
  }
}
