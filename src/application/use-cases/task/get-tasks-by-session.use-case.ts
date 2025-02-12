import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../../../core/entities/task.entity';
import { ITaskRepository } from '../../../core/interfaces/repositories/task.repository.interface';

@Injectable()
export class GetTasksBySessionUseCase {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(sessionId: string): Promise<Task[]> {
    return this.taskRepository.findBySessionId(sessionId);
  }
}
