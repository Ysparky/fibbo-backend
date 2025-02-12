import { Inject, Injectable } from '@nestjs/common';
import { TaskNotFoundException } from 'src/core/exceptions/task.exception';
import { Task } from '../../../core/entities/task.entity';
import { ITaskRepository } from '../../../core/interfaces/repositories/task.repository.interface';

@Injectable()
export class GetTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(id: string): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new TaskNotFoundException(id);
    }
    return task;
  }
}
