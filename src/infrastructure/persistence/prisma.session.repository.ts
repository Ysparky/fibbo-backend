import { Injectable } from '@nestjs/common';
import { Session } from '../../core/entities/session.entity';
import { User } from '../../core/entities/user.entity';
import { ISessionRepository } from '../../core/interfaces/repositories/session.repository.interface';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private prisma: PrismaService) {}

  async create(session: Session): Promise<Session> {
    const createdSession = await this.prisma.session.create({
      data: {
        id: session.id,
        name: session.name,
        moderatorId: session.moderatorId,
        isVotingActive: session.isVotingActive,
        participants: {
          create: session.participants.map((participant) => ({
            id: participant.id,
            name: participant.name,
            role: participant.role,
          })),
        },
      },
      include: {
        participants: true,
        tasks: true,
      },
    });

    return this.mapToEntity(createdSession);
  }

  async findById(id: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        participants: true,
        tasks: {
          include: {
            votes: true,
          },
        },
      },
    });

    return session ? this.mapToEntity(session) : null;
  }

  async update(session: Session): Promise<Session> {
    const updatedSession = await this.prisma.session.update({
      where: { id: session.id },
      data: {
        name: session.name,
        currentTaskId: session.currentTaskId,
        isVotingActive: session.isVotingActive,
      },
      include: {
        participants: true,
        tasks: {
          include: {
            votes: true,
          },
        },
      },
    });

    return this.mapToEntity(updatedSession);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id },
    });
  }

  async addParticipant(sessionId: string, userId: string): Promise<Session> {
    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        participants: {
          connect: { id: userId },
        },
      },
      include: {
        participants: true,
        tasks: {
          include: {
            votes: true,
          },
        },
      },
    });

    return this.mapToEntity(updatedSession);
  }

  async removeParticipant(sessionId: string, userId: string): Promise<Session> {
    const updatedSession = await this.prisma.session.update({
      where: { id: sessionId },
      data: {
        participants: {
          disconnect: { id: userId },
        },
      },
      include: {
        participants: true,
        tasks: {
          include: {
            votes: true,
          },
        },
      },
    });

    return this.mapToEntity(updatedSession);
  }

  private mapToEntity(prismaSession: any): Session {
    const session = new Session(
      prismaSession.id,
      prismaSession.name,
      prismaSession.moderatorId,
    );
    session.currentTaskId = prismaSession.currentTaskId;
    session.isVotingActive = prismaSession.isVotingActive;
    session.participants = prismaSession.participants.map(
      (p: any) => new User(p.id, p.name, p.role),
    );
    session.tasks = prismaSession.tasks;
    return session;
  }
}
