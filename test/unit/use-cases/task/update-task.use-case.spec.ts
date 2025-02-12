import { Test } from '@nestjs/testing';
import { UpdateTaskDto } from 'src/application/dto/task/update-task.dto';
import { UpdateTaskUseCase } from 'src/application/use-cases/task/update-task.use-case';
import { Task } from 'src/core/entities/task.entity';
import {
  TaskNotFoundException,
  TaskValidationException,
} from 'src/core/exceptions/task.exception';
import { ITaskRepository } from 'src/core/interfaces/repositories/task.repository.interface';

describe('UpdateTaskUseCase', () => {
  let useCase: UpdateTaskUseCase;
  let taskRepository: ITaskRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateTaskUseCase,
        {
          provide: 'ITaskRepository',
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<UpdateTaskUseCase>(UpdateTaskUseCase);
    taskRepository = moduleRef.get<ITaskRepository>('ITaskRepository');
  });

  it('should update task when valid data provided', async () => {
    // Arrange
    const taskId = 'test-task-id';
    const dto: UpdateTaskDto = {
      title: 'Updated Task',
      description: 'Updated Description',
    };

    const existingTask = new Task(
      taskId,
      'Original Task',
      'Original Description',
      'session-id',
    );
    const updatedTask = new Task(
      taskId,
      dto.title,
      dto.description,
      'session-id',
    );

    jest.spyOn(taskRepository, 'findById').mockResolvedValue(existingTask);
    jest.spyOn(taskRepository, 'update').mockResolvedValue(updatedTask);

    // Act
    const result = await useCase.execute(taskId, dto);

    // Assert
    expect(result).toBeDefined();
    expect(result.title).toBe(dto.title);
    expect(result.description).toBe(dto.description);
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(taskRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: taskId,
        title: dto.title,
        description: dto.description,
      }),
    );
  });

  it('should throw TaskNotFoundException when task not found', async () => {
    // Arrange
    const taskId = 'non-existent-task';
    const dto: UpdateTaskDto = {
      title: 'Updated Task',
    };

    jest.spyOn(taskRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(taskId, dto)).rejects.toThrow(
      TaskNotFoundException,
    );
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(taskRepository.update).not.toHaveBeenCalled();
  });

  it('should throw TaskValidationException when no valid update fields provided', async () => {
    // Arrange
    const taskId = 'test-task-id';
    const dto: UpdateTaskDto = {};
    const existingTask = new Task(
      taskId,
      'Original Task',
      'Original Description',
      'session-id',
    );

    jest.spyOn(taskRepository, 'findById').mockResolvedValue(existingTask);

    // Act & Assert
    await expect(useCase.execute(taskId, dto)).rejects.toThrow(
      TaskValidationException,
    );
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(taskRepository.update).not.toHaveBeenCalled();
  });
});
