import { Test } from '@nestjs/testing';
import { CreateTaskDto } from 'src/application/dto/task/create-task.dto';
import { CreateTaskUseCase } from 'src/application/use-cases/task/create-task.use-case';
import { Session } from 'src/core/entities/session.entity';
import { Task } from 'src/core/entities/task.entity';
import { SessionNotFoundException } from 'src/core/exceptions/session.exception';
import { ISessionRepository } from 'src/core/interfaces/repositories/session.repository.interface';
import { ITaskRepository } from 'src/core/interfaces/repositories/task.repository.interface';

describe('CreateTaskUseCase', () => {
  let useCase: CreateTaskUseCase;
  let taskRepository: ITaskRepository;
  let sessionRepository: ISessionRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateTaskUseCase,
        {
          provide: 'ITaskRepository',
          useValue: {
            create: jest.fn(),
          },
        },
        {
          provide: 'ISessionRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<CreateTaskUseCase>(CreateTaskUseCase);
    taskRepository = moduleRef.get<ITaskRepository>('ITaskRepository');
    sessionRepository = moduleRef.get<ISessionRepository>('ISessionRepository');
  });

  it('should create a task when session exists', async () => {
    // Arrange
    const dto: CreateTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
      sessionId: 'test-session-id',
    };

    const session = new Session(dto.sessionId, 'Test Session', 'moderator-id');
    const expectedTask = new Task(
      expect.any(String),
      dto.title,
      dto.description,
      dto.sessionId,
    );

    jest.spyOn(sessionRepository, 'findById').mockResolvedValue(session);
    jest.spyOn(taskRepository, 'create').mockResolvedValue(expectedTask);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result).toBeDefined();
    expect(result.title).toBe(dto.title);
    expect(result.description).toBe(dto.description);
    expect(result.sessionId).toBe(dto.sessionId);
    expect(sessionRepository.findById).toHaveBeenCalledWith(dto.sessionId);
    expect(taskRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        title: dto.title,
        description: dto.description,
        sessionId: dto.sessionId,
      }),
    );
  });

  it('should throw SessionNotFoundException when session not found', async () => {
    // Arrange
    const dto: CreateTaskDto = {
      title: 'Test Task',
      description: 'Test Description',
      sessionId: 'non-existent-session',
    };

    jest.spyOn(sessionRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(
      SessionNotFoundException,
    );
    expect(sessionRepository.findById).toHaveBeenCalledWith(dto.sessionId);
    expect(taskRepository.create).not.toHaveBeenCalled();
  });
});
