import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../../../core/entities/task.entity';
import {
  TaskNotFoundException,
  TaskValidationException,
} from '../../../core/exceptions/task.exception';
import { ITaskRepository } from '../../../core/interfaces/repositories/task.repository.interface';
import { UpdateTaskDto } from '../../dto/update-task.dto';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.taskRepository.findById(id);
    if (!task) {
      throw new TaskNotFoundException(id);
    }

    if (!dto.title && !dto.description) {
      throw new TaskValidationException('No valid update fields provided');
    }

    return this.taskRepository.update({
      ...task,
      ...dto,
    });
  }
}
