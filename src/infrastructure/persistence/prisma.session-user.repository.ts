import { Injectable } from '@nestjs/common';
import { UserRole } from '../../core/entities/session-user.entity';
import { ISessionUserRepository } from '../../core/interfaces/repositories/session-user.repository.interface';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaSessionUserRepository implements ISessionUserRepository {
  constructor(private prisma: PrismaService) {}

  async getUserRole(
    userId: string,
    sessionId: string,
  ): Promise<UserRole | null> {
    const sessionUser = await this.prisma.sessionUser.findUnique({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    });

    return sessionUser?.role as UserRole | null;
  }
}
