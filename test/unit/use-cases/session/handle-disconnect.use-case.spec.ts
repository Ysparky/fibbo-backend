import { Test } from '@nestjs/testing';
import { HandleDisconnectUseCase } from 'src/application/use-cases/session/handle-disconnect.use-case';
import { Session } from 'src/core/entities/session.entity';
import { User, UserRole } from 'src/core/entities/user.entity';
import { ISessionRepository } from 'src/core/interfaces/repositories/session.repository.interface';

describe('HandleDisconnectUseCase', () => {
  let useCase: HandleDisconnectUseCase;
  let sessionRepository: ISessionRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        HandleDisconnectUseCase,
        {
          provide: 'ISessionRepository',
          useValue: {
            findByParticipantId: jest.fn(),
            removeParticipantFromAllSessions: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<HandleDisconnectUseCase>(HandleDisconnectUseCase);
    sessionRepository = moduleRef.get<ISessionRepository>('ISessionRepository');
  });

  it('should handle participant disconnect and remove from session', async () => {
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
    const result = await useCase.execute(userId, true);

    // Assert
    expect(result).toEqual({
      sessionId,
      userId,
    });
    expect(sessionRepository.findByParticipantId).toHaveBeenCalledWith(userId);
    expect(
      sessionRepository.removeParticipantFromAllSessions,
    ).toHaveBeenCalledWith(userId);
  });

  it('should handle participant disconnect without removing from session', async () => {
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
    const result = await useCase.execute(userId, false);

    // Assert
    expect(result).toEqual({
      sessionId,
      userId,
    });
    expect(sessionRepository.findByParticipantId).toHaveBeenCalledWith(userId);
    expect(
      sessionRepository.removeParticipantFromAllSessions,
    ).not.toHaveBeenCalled();
  });

  it('should handle disconnect when user is not in any session', async () => {
    // Arrange
    const userId = 'test-user-id';
    jest
      .spyOn(sessionRepository, 'findByParticipantId')
      .mockResolvedValue(null);

    // Act
    const result = await useCase.execute(userId, true);

    // Assert
    expect(result).toEqual({
      sessionId: null,
      userId,
    });
    expect(sessionRepository.findByParticipantId).toHaveBeenCalledWith(userId);
    expect(
      sessionRepository.removeParticipantFromAllSessions,
    ).not.toHaveBeenCalled();
  });
});
