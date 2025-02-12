import { Test } from '@nestjs/testing';
import { ChangeCurrentTaskUseCase } from 'src/application/use-cases/task/change-current-task.use-case';
import { Session } from 'src/core/entities/session.entity';
import { Task } from 'src/core/entities/task.entity';
import { SessionNotFoundException } from 'src/core/exceptions/session.exception';
import { ISessionRepository } from 'src/core/interfaces/repositories/session.repository.interface';
import { ITaskRepository } from 'src/core/interfaces/repositories/task.repository.interface';
describe('ChangeCurrentTaskUseCase', () => {
  let useCase: ChangeCurrentTaskUseCase;
  let sessionRepository: ISessionRepository;
  let taskRepository: ITaskRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        ChangeCurrentTaskUseCase,
        {
          provide: 'ISessionRepository',
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: 'ITaskRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<ChangeCurrentTaskUseCase>(ChangeCurrentTaskUseCase);
    sessionRepository = moduleRef.get<ISessionRepository>('ISessionRepository');
    taskRepository = moduleRef.get<ITaskRepository>('ITaskRepository');
  });

  it('should update current task when session exists', async () => {
    // Arrange
    const sessionId = 'test-session-id';
    const taskId = 'new-task-id';
    const session = new Session(sessionId, 'Test Session', 'moderator-id');
    const task = new Task(taskId, 'New Task', 'New Description', sessionId);

    jest.spyOn(sessionRepository, 'findById').mockResolvedValue(session);
    jest.spyOn(sessionRepository, 'update').mockResolvedValue(session);
    jest.spyOn(taskRepository, 'findById').mockResolvedValue(task);

    // Act
    await useCase.execute(sessionId, taskId);

    // Assert
    expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(sessionRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: sessionId,
        currentTaskId: taskId,
      }),
    );
  });

  it('should throw SessionNotFoundException when session not found', async () => {
    // Arrange
    const sessionId = 'non-existent-session';
    const taskId = 'task-id';
    jest.spyOn(sessionRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(sessionId, taskId)).rejects.toThrow(
      SessionNotFoundException,
    );
    expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
    expect(sessionRepository.update).not.toHaveBeenCalled();
  });
});
