import { Test } from '@nestjs/testing';
import { DeleteTaskUseCase } from 'src/application/use-cases/task/delete-task.use-case';
import { Task } from 'src/core/entities/task.entity';
import { TaskNotFoundException } from 'src/core/exceptions/task.exception';
import { ITaskRepository } from 'src/core/interfaces/repositories/task.repository.interface';

describe('DeleteTaskUseCase', () => {
  let useCase: DeleteTaskUseCase;
  let taskRepository: ITaskRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DeleteTaskUseCase,
        {
          provide: 'ITaskRepository',
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<DeleteTaskUseCase>(DeleteTaskUseCase);
    taskRepository = moduleRef.get<ITaskRepository>('ITaskRepository');
  });

  it('should delete task when found', async () => {
    // Arrange
    const taskId = 'test-task-id';
    const task = new Task(
      taskId,
      'Test Task',
      'Test Description',
      'session-id',
    );

    jest.spyOn(taskRepository, 'findById').mockResolvedValue(task);
    jest.spyOn(taskRepository, 'delete').mockResolvedValue();

    // Act
    await useCase.execute(taskId);

    // Assert
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(taskRepository.delete).toHaveBeenCalledWith(taskId);
  });

  it('should throw NotFoundException when task not found', async () => {
    // Arrange
    const taskId = 'non-existent-task';
    jest.spyOn(taskRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(taskId)).rejects.toThrow(
      TaskNotFoundException,
    );
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(taskRepository.delete).not.toHaveBeenCalled();
  });
});
