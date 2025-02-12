import { Injectable } from '@nestjs/common';
import { Vote } from '../../core/entities/vote.entity';
import { IVoteRepository } from '../../core/interfaces/repositories/vote.repository.interface';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaVoteRepository implements IVoteRepository {
  constructor(private prisma: PrismaService) {}

  async create(vote: Vote): Promise<Vote> {
    const createdVote = await this.prisma.vote.create({
      data: {
        id: vote.id,
        taskId: vote.taskId,
        userId: vote.userId,
        value: vote.value,
        timestamp: vote.timestamp,
      },
    });

    return this.mapToEntity(createdVote);
  }

  async findById(id: string): Promise<Vote | null> {
    const vote = await this.prisma.vote.findUnique({
      where: { id },
    });

    return vote ? this.mapToEntity(vote) : null;
  }

  async findByTaskId(taskId: string): Promise<Vote[]> {
    const votes = await this.prisma.vote.findMany({
      where: { taskId },
    });

    return votes.map((vote) => this.mapToEntity(vote));
  }

  async findByUserId(userId: string): Promise<Vote[]> {
    const votes = await this.prisma.vote.findMany({
      where: { userId },
    });

    return votes.map((vote) => this.mapToEntity(vote));
  }

  async findByUserAndTask(
    userId: string,
    taskId: string,
  ): Promise<Vote | null> {
    const vote = await this.prisma.vote.findFirst({
      where: { userId, taskId },
    });

    return vote ? this.mapToEntity(vote) : null;
  }

  async update(vote: Vote): Promise<Vote> {
    const updatedVote = await this.prisma.vote.update({
      where: { id: vote.id },
      data: {
        value: vote.value,
        timestamp: vote.timestamp,
      },
    });

    return this.mapToEntity(updatedVote);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.vote.delete({
      where: { id },
    });
  }

  private mapToEntity(prismaVote: any): Vote {
    return new Vote(
      prismaVote.id,
      prismaVote.taskId,
      prismaVote.userId,
      prismaVote.value,
    );
  }
}
