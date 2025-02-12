import { Test } from '@nestjs/testing';
import { DeleteSessionUseCase } from 'src/application/use-cases/session/delete-session.use-case';
import { Session } from 'src/core/entities/session.entity';
import { SessionNotFoundException } from 'src/core/exceptions/session.exception';
import { ISessionRepository } from 'src/core/interfaces/repositories/session.repository.interface';

describe('DeleteSessionUseCase', () => {
  let useCase: DeleteSessionUseCase;
  let sessionRepository: ISessionRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        DeleteSessionUseCase,
        {
          provide: 'ISessionRepository',
          useValue: {
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<DeleteSessionUseCase>(DeleteSessionUseCase);
    sessionRepository = moduleRef.get<ISessionRepository>('ISessionRepository');
  });

  it('should delete session when found', async () => {
    // Arrange
    const sessionId = 'test-session-id';
    const session = new Session(sessionId, 'Test Session', 'moderator-id');

    jest.spyOn(sessionRepository, 'findById').mockResolvedValue(session);
    jest.spyOn(sessionRepository, 'delete').mockResolvedValue();

    // Act
    await useCase.execute(sessionId);

    // Assert
    expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
    expect(sessionRepository.delete).toHaveBeenCalledWith(sessionId);
  });

  it('should throw SessionNotFoundException when session not found', async () => {
    // Arrange
    const sessionId = 'non-existent-session';
    jest.spyOn(sessionRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(sessionId)).rejects.toThrow(
      SessionNotFoundException,
    );
    expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
    expect(sessionRepository.delete).not.toHaveBeenCalled();
  });
});
