import { Test } from '@nestjs/testing';
import { GetTasksBySessionUseCase } from 'src/application/use-cases/task/get-tasks-by-session.use-case';
import { Task } from 'src/core/entities/task.entity';
import { ITaskRepository } from 'src/core/interfaces/repositories/task.repository.interface';

describe('GetTasksBySessionUseCase', () => {
  let useCase: GetTasksBySessionUseCase;
  let taskRepository: ITaskRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetTasksBySessionUseCase,
        {
          provide: 'ITaskRepository',
          useValue: {
            findBySessionId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<GetTasksBySessionUseCase>(GetTasksBySessionUseCase);
    taskRepository = moduleRef.get<ITaskRepository>('ITaskRepository');
  });

  it('should return tasks for session', async () => {
    // Arrange
    const sessionId = 'test-session-id';
    const tasks = [
      new Task('task-1', 'Task 1', 'Description 1', sessionId),
      new Task('task-2', 'Task 2', 'Description 2', sessionId),
    ];

    jest.spyOn(taskRepository, 'findBySessionId').mockResolvedValue(tasks);

    // Act
    const result = await useCase.execute(sessionId);

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].sessionId).toBe(sessionId);
    expect(result[1].sessionId).toBe(sessionId);
    expect(taskRepository.findBySessionId).toHaveBeenCalledWith(sessionId);
  });

  it('should return empty array when no tasks found', async () => {
    // Arrange
    const sessionId = 'test-session-id';
    jest.spyOn(taskRepository, 'findBySessionId').mockResolvedValue([]);

    // Act
    const result = await useCase.execute(sessionId);

    // Assert
    expect(result).toHaveLength(0);
    expect(taskRepository.findBySessionId).toHaveBeenCalledWith(sessionId);
  });
});
