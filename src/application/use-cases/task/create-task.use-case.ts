import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '../../../core/entities/task.entity';
import { ISessionRepository } from '../../../core/interfaces/repositories/session.repository.interface';
import { ITaskRepository } from '../../../core/interfaces/repositories/task.repository.interface';
import { CreateTaskDto } from '../../dto/create-task.dto';

@Injectable()
export class CreateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(dto: CreateTaskDto): Promise<Task> {
    const session = await this.sessionRepository.findById(dto.sessionId);
    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const task = new Task(uuidv4(), dto.title, dto.description, dto.sessionId);

    return this.taskRepository.create(task);
  }
}
