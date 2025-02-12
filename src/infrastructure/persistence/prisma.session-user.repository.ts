import { Injectable } from '@nestjs/common';
import { CreateSessionUserDto } from 'src/application/dto/session-user/create-session-user.dto';
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

  async create(data: CreateSessionUserDto): Promise<void> {
    await this.prisma.sessionUser.create({
      data: {
        userId: data.userId,
        sessionId: data.sessionId,
        role: data.role,
      },
    });
  }

  async remove(userId: string, sessionId: string): Promise<void> {
    await this.prisma.sessionUser.delete({
      where: {
        userId_sessionId: {
          userId,
          sessionId,
        },
      },
    });
  }

  async removeFromAllSessions(userId: string): Promise<void> {
    await this.prisma.sessionUser.deleteMany({
      where: {
        userId,
      },
    });
  }
}
