import { Test } from '@nestjs/testing';
import { HandleReconnectUseCase } from 'src/application/use-cases/session/handle-reconnect.use-case';
import { Session } from 'src/core/entities/session.entity';
import { User, UserRole } from 'src/core/entities/user.entity';
import { ISessionRepository } from 'src/core/interfaces/repositories/session.repository.interface';

describe('HandleReconnectUseCase', () => {
  let useCase: HandleReconnectUseCase;
  let sessionRepository: ISessionRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HandleReconnectUseCase,
        {
          provide: 'ISessionRepository',
          useValue: {
            findByParticipantId: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<HandleReconnectUseCase>(HandleReconnectUseCase);
    sessionRepository = moduleRef.get<ISessionRepository>('ISessionRepository');
  });

  it('should return session ID when user is in a session', async () => {
    // Arrange
    const userId = 'test-user-id';
    const sessionId = 'test-session-id';
    const session = new Session(sessionId, 'Test Session', 'moderator-id');
    session.participants = [
      new User(userId, 'Test User', UserRole.PARTICIPANT),
    ];

    jest
      .spyOn(sessionRepository, 'findByParticipantId')
      .mockResolvedValue(session);

    // Act
    const result = await useCase.execute(userId);

    // Assert
    expect(result).toBe(sessionId);
    expect(sessionRepository.findByParticipantId).toHaveBeenCalledWith(userId);
  });

  it('should return null when user is not in any session', async () => {
    // Arrange
    const userId = 'test-user-id';
    jest
      .spyOn(sessionRepository, 'findByParticipantId')
      .mockResolvedValue(null);

    // Act
    const result = await useCase.execute(userId);

    // Assert
    expect(result).toBeNull();
    expect(sessionRepository.findByParticipantId).toHaveBeenCalledWith(userId);
  });
});
