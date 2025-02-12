import { Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '../../../core/entities/task.entity';
import { ITaskRepository } from '../../../core/interfaces/task.repository.interface';

@Injectable()
export class GetTaskUseCase {
  constructor(private readonly taskRepository: ITaskRepository) {}

  async execute(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }
}
