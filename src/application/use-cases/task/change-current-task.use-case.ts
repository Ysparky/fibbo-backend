import { Inject, Injectable } from '@nestjs/common';
import { SessionNotFoundException } from '../../../core/exceptions/session.exception';
import {
  TaskNotFoundException,
  TaskOperationException,
} from '../../../core/exceptions/task.exception';
import { ISessionRepository } from '../../../core/interfaces/repositories/session.repository.interface';
import { ITaskRepository } from '../../../core/interfaces/repositories/task.repository.interface';

@Injectable()
export class ChangeCurrentTaskUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
  ) {}

  async execute(sessionId: string, taskId: string | null): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new SessionNotFoundException(sessionId);
    }

    if (taskId) {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new TaskNotFoundException(taskId);
      }
      if (task.sessionId !== sessionId) {
        throw new TaskOperationException(
          'Task does not belong to the specified session',
        );
      }
    }

    await this.sessionRepository.update(sessionId, {
      ...session,
      currentTaskId: taskId,
    });
  }
}
