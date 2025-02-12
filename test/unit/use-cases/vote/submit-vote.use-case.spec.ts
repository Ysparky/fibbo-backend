import { Test } from '@nestjs/testing';
import { SubmitVoteDto } from 'src/application/dto/vote/submit-vote.dto';
import { SubmitVoteUseCase } from 'src/application/use-cases/vote/submit-vote.use-case';
import { Task } from 'src/core/entities/task.entity';
import { Vote } from 'src/core/entities/vote.entity';
import { TaskNotFoundException } from 'src/core/exceptions/task.exception';
import { ITaskRepository } from 'src/core/interfaces/repositories/task.repository.interface';
import { IVoteRepository } from 'src/core/interfaces/repositories/vote.repository.interface';

describe('SubmitVoteUseCase', () => {
  let useCase: SubmitVoteUseCase;
  let voteRepository: IVoteRepository;
  let taskRepository: ITaskRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SubmitVoteUseCase,
        {
          provide: 'IVoteRepository',
          useValue: {
            create: jest.fn(),
            findByUserAndTask: jest.fn(),
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

    useCase = moduleRef.get<SubmitVoteUseCase>(SubmitVoteUseCase);
    voteRepository = moduleRef.get<IVoteRepository>('IVoteRepository');
    taskRepository = moduleRef.get<ITaskRepository>('ITaskRepository');
  });

  it('should submit vote when task exists', async () => {
    // Arrange
    const userId = 'test-user-id';

    const dto: SubmitVoteDto = {
      taskId: 'test-task-id',
      value: 5,
    };

    const task = new Task(
      dto.taskId,
      'Test Task',
      'Test Description',
      'session-id',
    );
    const expectedVote = new Vote(
      expect.any(String),
      dto.taskId,
      userId,
      dto.value,
    );

    jest.spyOn(taskRepository, 'findById').mockResolvedValue(task);
    jest.spyOn(voteRepository, 'create').mockResolvedValue(expectedVote);

    // Act
    const result = await useCase.execute(userId, dto);

    // Assert
    expect(result).toBeDefined();
    expect(result.taskId).toBe(dto.taskId);
    expect(result.userId).toBe(userId);
    expect(result.value).toBe(dto.value);
    expect(taskRepository.findById).toHaveBeenCalledWith(dto.taskId);
    expect(voteRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        taskId: dto.taskId,
        userId: userId,
        value: dto.value,
      }),
    );
  });

  it('should throw TaskNotFoundException when task not found', async () => {
    // Arrange
    const userId = 'test-user-id';
    const dto: SubmitVoteDto = {
      taskId: 'non-existent-task',
      value: 5,
    };

    jest.spyOn(taskRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(userId, dto)).rejects.toThrow(
      TaskNotFoundException,
    );
    expect(taskRepository.findById).toHaveBeenCalledWith(dto.taskId);
    expect(voteRepository.create).not.toHaveBeenCalled();
  });
});
