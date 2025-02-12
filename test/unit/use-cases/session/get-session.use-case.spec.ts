import { Test } from '@nestjs/testing';
import { GetSessionUseCase } from 'src/application/use-cases/session/get-session.use-case';
import { Session } from 'src/core/entities/session.entity';
import { SessionNotFoundException } from 'src/core/exceptions/session.exception';
import { ISessionRepository } from 'src/core/interfaces/repositories/session.repository.interface';

describe('GetSessionUseCase', () => {
  let useCase: GetSessionUseCase;
  let sessionRepository: ISessionRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetSessionUseCase,
        {
          provide: 'ISessionRepository',
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<GetSessionUseCase>(GetSessionUseCase);
    sessionRepository = moduleRef.get<ISessionRepository>('ISessionRepository');
  });

  it('should return session when found', async () => {
    // Arrange
    const sessionId = 'test-session-id';
    const session = new Session(sessionId, 'Test Session', 'moderator-id');

    jest.spyOn(sessionRepository, 'findById').mockResolvedValue(session);

    // Act
    const result = await useCase.execute(sessionId);

    // Assert
    expect(result).toBeDefined();
    expect(result.id).toBe(sessionId);
    expect(result.name).toBe('Test Session');
    expect(sessionRepository.findById).toHaveBeenCalledWith(sessionId);
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
  });
});
