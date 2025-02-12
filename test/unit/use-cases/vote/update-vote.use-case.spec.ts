import { Test } from '@nestjs/testing';
import { UpdateVotePayloadDto } from 'src/application/dto/vote/update-vote-payload.dto';
import { UpdateVoteUseCase } from 'src/application/use-cases/vote/update-vote.use-case';
import { Vote } from 'src/core/entities/vote.entity';
import { VoteNotFoundException } from 'src/core/exceptions/vote.exception';
import { IVoteRepository } from 'src/core/interfaces/repositories/vote.repository.interface';

describe('UpdateVoteUseCase', () => {
  let useCase: UpdateVoteUseCase;
  let voteRepository: IVoteRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateVoteUseCase,
        {
          provide: 'IVoteRepository',
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<UpdateVoteUseCase>(UpdateVoteUseCase);
    voteRepository = moduleRef.get<IVoteRepository>('IVoteRepository');
  });

  it('should update vote when found', async () => {
    // Arrange
    const voteId = 'test-vote-id';
    const taskId = 'test-task-id';
    const userId = 'test-user-id';
    const dto: UpdateVotePayloadDto = {
      voteId,
      value: 8,
    };

    const existingVote = new Vote(voteId, taskId, userId, 5);
    const updatedVote = new Vote(voteId, taskId, userId, dto.value);

    jest.spyOn(voteRepository, 'findById').mockResolvedValue(existingVote);
    jest.spyOn(voteRepository, 'update').mockResolvedValue(updatedVote);

    // Act
    const result = await useCase.execute(voteId, userId, dto);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(voteId);
    expect(result.value).toBe(dto.value);
    expect(voteRepository.findById).toHaveBeenCalledWith(voteId);
    expect(voteRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: voteId,
        value: dto.value,
      }),
    );
  });

  it('should throw VoteNotFoundException when vote not found', async () => {
    // Arrange
    const voteId = 'non-existent-vote';
    const userId = 'test-user-id';
    const dto: UpdateVotePayloadDto = {
      voteId,
      value: 8,
    };

    jest.spyOn(voteRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(voteId, userId, dto)).rejects.toThrow(
      VoteNotFoundException,
    );
    expect(voteRepository.findById).toHaveBeenCalledWith(voteId);
    expect(voteRepository.update).not.toHaveBeenCalled();
  });
});
