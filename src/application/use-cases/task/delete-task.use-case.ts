import { Inject, Injectable } from '@nestjs/common';
import { TaskNotFoundException } from '../../../core/exceptions/task.exception';
import { ITaskRepository } from '../../../core/interfaces/repositories/task.repository.interface';

@Injectable()
export class DeleteTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new TaskNotFoundException(id);
    }
    await this.taskRepository.delete(id);
  }
}
