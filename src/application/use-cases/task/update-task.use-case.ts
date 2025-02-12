import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Task } from '../../../core/entities/task.entity';
import { ITaskRepository } from '../../../core/interfaces/repositories/task.repository.interface';
import { UpdateTaskDto } from '../../dto/update-task.dto';

@Injectable()
export class UpdateTaskUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(id: string, dto: UpdateTaskDto): Promise<Task> {
    const existingTask = await this.taskRepository.findById(id);
    if (!existingTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    existingTask.title = dto.title ?? existingTask.title;
    existingTask.description = dto.description ?? existingTask.description;
    existingTask.finalEstimate =
      dto.finalEstimate ?? existingTask.finalEstimate;

    return this.taskRepository.update(existingTask);
  }
}
