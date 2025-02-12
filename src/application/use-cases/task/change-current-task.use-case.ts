import { Inject, Injectable } from '@nestjs/common';
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
      throw new Error('Session not found');
    }

    if (taskId) {
      const task = await this.taskRepository.findById(taskId);
      if (!task) {
        throw new Error('Task not found');
      }
    }

    await this.sessionRepository.update({
      ...session,
      currentTaskId: taskId,
    });
  }
}
