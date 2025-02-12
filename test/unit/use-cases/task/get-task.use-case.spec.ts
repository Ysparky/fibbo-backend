import { Test } from '@nestjs/testing';
import { GetTaskUseCase } from 'src/application/use-cases/task/get-task.use-case';
import { Task } from 'src/core/entities/task.entity';
import { TaskNotFoundException } from 'src/core/exceptions/task.exception';
import { ITaskRepository } from 'src/core/interfaces/repositories/task.repository.interface';

describe('GetTaskUseCase', () => {
  let useCase: GetTaskUseCase;
  let taskRepository: ITaskRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetTaskUseCase,
        {
          provide: 'ITaskRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<GetTaskUseCase>(GetTaskUseCase);
    taskRepository = moduleRef.get<ITaskRepository>('ITaskRepository');
  });

  it('should return task when found', async () => {
    // Arrange
    const taskId = 'test-task-id';
    const task = new Task(
      taskId,
      'Test Task',
      'Test Description',
      'session-id',
    );

    jest.spyOn(taskRepository, 'findById').mockResolvedValue(task);

    // Act
    const result = await useCase.execute(taskId);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(taskId);
    expect(result.title).toBe('Test Task');
    expect(result.description).toBe('Test Description');
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
  });

  it('should throw TaskNotFoundException when task not found', async () => {
    // Arrange
    const taskId = 'non-existent-task';
    jest.spyOn(taskRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(taskId)).rejects.toThrow(
      TaskNotFoundException,
    );
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
  });
});
