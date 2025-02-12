import { Injectable } from '@nestjs/common';
import { UserRole } from '../../../core/entities/session-user.entity';
import { Session } from '../../../core/entities/session.entity';
import { ISessionUserRepository } from '../../../core/interfaces/repositories/session-user.repository.interface';
import { ISessionRepository } from '../../../core/interfaces/repositories/session.repository.interface';
import { CreateSessionDto } from '../../dto/session/create-session.dto';

@Injectable()
export class CreateSessionUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly sessionUserRepository: ISessionUserRepository,
  ) {}

  async execute({ name, moderatorId }: CreateSessionDto): Promise<Session> {
    // Create session
    const session = await this.sessionRepository.create({ name, moderatorId });

    // Create session-user relationship with MODERATOR role
    await this.sessionUserRepository.create({
      userId: moderatorId,
      sessionId: session.id,
      role: UserRole.MODERATOR,
    });

    // Update session with moderator role
    session.users = [
      {
        userId: moderatorId,
        sessionId: session.id,
        role: UserRole.MODERATOR,
      },
    ];

    return session;
  }
}
