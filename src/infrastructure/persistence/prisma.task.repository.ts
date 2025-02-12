import { Injectable } from '@nestjs/common';
import { Task } from '../../core/entities/task.entity';
import { ITaskRepository } from '../../core/interfaces/repositories/task.repository.interface';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaTaskRepository implements ITaskRepository {
  constructor(private prisma: PrismaService) {}

  async create(task: Task): Promise<Task> {
    const createdTask = await this.prisma.task.create({
      data: {
        id: task.id,
        title: task.title,
        description: task.description,
        sessionId: task.sessionId,
      },
      include: {
        votes: true,
      },
    });

    return this.mapToEntity(createdTask);
  }

  async findById(id: string): Promise<Task | null> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        votes: true,
      },
    });

    return task ? this.mapToEntity(task) : null;
  }

  async findBySessionId(sessionId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({
      where: { sessionId },
      include: {
        votes: true,
      },
    });

    return tasks.map((task) => this.mapToEntity(task));
  }

  async update(task: Task): Promise<Task> {
    const updatedTask = await this.prisma.task.update({
      where: { id: task.id },
      data: {
        title: task.title,
        description: task.description,
        finalEstimate: task.finalEstimate,
      },
      include: {
        votes: true,
      },
    });

    return this.mapToEntity(updatedTask);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.task.delete({
      where: { id },
    });
  }

  private mapToEntity(prismaTask: any): Task {
    const task = new Task(
      prismaTask.id,
      prismaTask.title,
      prismaTask.description,
      prismaTask.sessionId,
    );
    task.finalEstimate = prismaTask.finalEstimate;
    task.votes = prismaTask.votes;
    return task;
  }
}
