import { Test } from '@nestjs/testing';
import { UpdateSessionDto } from 'src/application/dto/session/update-session.dto';
import { UpdateSessionUseCase } from 'src/application/use-cases/session/update-session.use-case';
import { Session } from 'src/core/entities/session.entity';
import { SessionNotFoundException } from 'src/core/exceptions/session.exception';
import { ISessionRepository } from 'src/core/interfaces/repositories/session.repository.interface';

describe('UpdateSessionUseCase', () => {
  let useCase: UpdateSessionUseCase;
  let sessionRepository: ISessionRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UpdateSessionUseCase,
        {
          provide: 'ISessionRepository',
          useValue: {
            findById: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<UpdateSessionUseCase>(UpdateSessionUseCase);
    sessionRepository = moduleRef.get<ISessionRepository>('ISessionRepository');
  });

  it('should update session properties', async () => {
    // Arrange
    const sessionId = 'test-session-id';
    const dto: UpdateSessionDto = {
      name: 'Updated Session',
      currentTaskId: 'new-task-id',
      isVotingActive: true,
    };

    const existingSession = new Session(
      sessionId,
      'Test Session',
      'moderator-id',
    );
    const updatedSession = new Session(sessionId, dto.name, 'moderator-id');
    updatedSession.currentTaskId = dto.currentTaskId;
    updatedSession.isVotingActive = dto.isVotingActive;

    jest
      .spyOn(sessionRepository, 'findById')
      .mockResolvedValue(existingSession);
    jest.spyOn(sessionRepository, 'update').mockResolvedValue(updatedSession);

    // Act
    const result = await useCase.execute(sessionId, dto);

    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe(dto.name);
    expect(result.currentTaskId).toBe(dto.currentTaskId);
    expect(result.isVotingActive).toBe(dto.isVotingActive);
    expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
    expect(sessionRepository.update).toHaveBeenCalledWith(
      expect.objectContaining({
        id: sessionId,
        name: dto.name,
        currentTaskId: dto.currentTaskId,
        isVotingActive: dto.isVotingActive,
      }),
    );
  });

  it('should throw SessionNotFoundException when session not found', async () => {
    // Arrange
    const sessionId = 'non-existent-session';
    const dto: UpdateSessionDto = {
      name: 'Updated Session',
    };

    jest.spyOn(sessionRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(sessionId, dto)).rejects.toThrow(
      SessionNotFoundException,
    );
    expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
    expect(sessionRepository.update).not.toHaveBeenCalled();
  });
});
