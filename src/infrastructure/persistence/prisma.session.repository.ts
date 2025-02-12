import { Injectable } from '@nestjs/common';
import { CreateSessionDto } from 'src/application/dto/session/create-session.dto';
import { v4 as uuidv4 } from 'uuid';
import { Session } from '../../core/entities/session.entity';
import { ISessionRepository } from '../../core/interfaces/repositories/session.repository.interface';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaSessionRepository implements ISessionRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateSessionDto): Promise<Session> {
    const session = await this.prisma.session.create({
      data: {
        id: uuidv4(),
        name: data.name,
        isVotingActive: false,
      },
      include: {
        users: true,
        tasks: true,
      },
    });

    return this.mapToEntity(session);
  }

  async findById(id: string): Promise<Session | null> {
    const session = await this.prisma.session.findUnique({
      where: { id },
      include: {
        users: true,
        tasks: true,
      },
    });

    return session ? this.mapToEntity(session) : null;
  }

  async update(id: string, data: Partial<Session>): Promise<Session> {
    const session = await this.prisma.session.update({
      where: { id },
      data: {
        name: data.name,
        currentTaskId: data.currentTaskId,
        isVotingActive: data.isVotingActive,
      },
      include: {
        users: true,
        tasks: true,
      },
    });

    return this.mapToEntity(session);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id },
    });
  }

  async findByParticipantId(userId: string): Promise<Session | null> {
    const session = await this.prisma.session.findFirst({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      include: {
        users: true,
        tasks: {
          include: {
            votes: true,
          },
        },
      },
    });

    return session ? this.mapToEntity(session) : null;
  }

  private mapToEntity(prismaSession: any): Session {
    const session = new Session(
      prismaSession.id,
      prismaSession.name,
      prismaSession.currentTaskId,
      prismaSession.isVotingActive,
    );
    session.tasks = prismaSession.tasks;
    return session;
  }
}
