import { Test } from '@nestjs/testing';
import { GetTaskVotesUseCase } from 'src/application/use-cases/vote/get-task-votes.use-case';
import { Task } from 'src/core/entities/task.entity';
import { Vote } from 'src/core/entities/vote.entity';
import { TaskNotFoundException } from 'src/core/exceptions/task.exception';
import { ITaskRepository } from 'src/core/interfaces/repositories/task.repository.interface';
import { IVoteRepository } from 'src/core/interfaces/repositories/vote.repository.interface';

describe('GetTaskVotesUseCase', () => {
  let useCase: GetTaskVotesUseCase;
  let voteRepository: IVoteRepository;
  let taskRepository: ITaskRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetTaskVotesUseCase,
        {
          provide: 'IVoteRepository',
          useValue: {
            findByTaskId: jest.fn(),
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

    useCase = moduleRef.get<GetTaskVotesUseCase>(GetTaskVotesUseCase);
    voteRepository = moduleRef.get<IVoteRepository>('IVoteRepository');
    taskRepository = moduleRef.get<ITaskRepository>('ITaskRepository');
  });

  it('should return votes for task', async () => {
    // Arrange
    const taskId = 'test-task-id';
    const task = new Task(
      taskId,
      'Test Task',
      'Test Description',
      'session-id',
    );
    const votes = [
      new Vote('vote-1', taskId, 'user-1', 3),
      new Vote('vote-2', taskId, 'user-2', 5),
    ];

    jest.spyOn(taskRepository, 'findById').mockResolvedValue(task);
    jest.spyOn(voteRepository, 'findByTaskId').mockResolvedValue(votes);

    // Act
    const result = await useCase.execute(taskId);

    // Assert
    expect(result).toHaveLength(2);
    expect(result[0].taskId).toBe(taskId);
    expect(result[1].taskId).toBe(taskId);
    expect(taskRepository.findById).toHaveBeenCalledWith(taskId);
    expect(voteRepository.findByTaskId).toHaveBeenCalledWith(taskId);
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
    expect(voteRepository.findByTaskId).not.toHaveBeenCalled();
  });
});
