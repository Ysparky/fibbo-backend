import { Injectable } from '@nestjs/common';
import { UserNotFoundException } from 'src/core/exceptions/user.exception';
import {
  SessionUser,
  UserRole,
} from '../../../core/entities/session-user.entity';
import { SessionNotFoundException } from '../../../core/exceptions/session.exception';
import { ISessionUserRepository } from '../../../core/interfaces/repositories/session-user.repository.interface';
import { ISessionRepository } from '../../../core/interfaces/repositories/session.repository.interface';
import { IUserRepository } from '../../../core/interfaces/repositories/user.repository.interface';
import { JoinSessionDto } from '../../dto/session/join-session.dto';

@Injectable()
export class JoinSessionUseCase {
  constructor(
    private readonly sessionRepository: ISessionRepository,
    private readonly sessionUserRepository: ISessionUserRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: JoinSessionDto): Promise<SessionUser> {
    // Verify session exists
    const session = await this.sessionRepository.findById(dto.sessionId);
    if (!session) {
      throw new SessionNotFoundException(dto.sessionId);
    }

    // Verify user exists
    const user = await this.userRepository.findById(dto.userId);
    if (!user) {
      throw new UserNotFoundException(dto.userId);
    }

    // Create session-user relationship
    await this.sessionUserRepository.create({
      userId: user.id,
      sessionId: session.id,
      role: UserRole.PARTICIPANT,
    });

    // Return updated session with the new user
    return {
      userId: user.id,
      sessionId: session.id,
      role: UserRole.PARTICIPANT,
    };
  }
}
