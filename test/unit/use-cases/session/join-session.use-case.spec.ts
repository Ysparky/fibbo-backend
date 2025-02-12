import { Test } from '@nestjs/testing';
import { JoinSessionDto } from 'src/application/dto/session/join-session.dto';
import { JoinSessionUseCase } from 'src/application/use-cases/session-user/join-session.use-case';
import { Session } from 'src/core/entities/session.entity';
import { User, UserRole } from 'src/core/entities/user.entity';
import { SessionNotFoundException } from 'src/core/exceptions/session.exception';
import { ISessionRepository } from 'src/core/interfaces/repositories/session.repository.interface';

describe('JoinSessionUseCase', () => {
  let useCase: JoinSessionUseCase;
  let sessionRepository: ISessionRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        JoinSessionUseCase,
        {
          provide: 'ISessionRepository',
          useValue: {
            findById: jest.fn(),
            addParticipant: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<JoinSessionUseCase>(JoinSessionUseCase);
    sessionRepository = moduleRef.get<ISessionRepository>('ISessionRepository');
  });

  it('should add participant to session', async () => {
    // Arrange
    const dto: JoinSessionDto = {
      sessionId: 'test-session-id',
      participantName: 'Test Participant',
    };

    const existingSession = new Session(
      'test-session-id',
      'Test Session',
      'moderator-id',
    );
    const updatedSession = new Session(
      'test-session-id',
      'Test Session',
      'moderator-id',
    );
    updatedSession.participants = [
      new User(expect.any(String), dto.participantName, UserRole.PARTICIPANT),
    ];

    jest
      .spyOn(sessionRepository, 'findById')
      .mockResolvedValue(existingSession);
    jest
      .spyOn(sessionRepository, 'addParticipant')
      .mockResolvedValue(updatedSession);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe(dto.participantName);
    expect(result.role).toBe(UserRole.PARTICIPANT);
    expect(sessionRepository.findById).toHaveBeenCalledWith(dto.sessionId);
    expect(sessionRepository.addParticipant).toHaveBeenCalledWith(
      dto.sessionId,
      expect.any(String),
    );
  });

  it('should throw SessionNotFoundException when session not found', async () => {
    // Arrange
    const dto: JoinSessionDto = {
      sessionId: 'non-existent-session',
      participantName: 'Test Participant',
    };

    jest.spyOn(sessionRepository, 'findById').mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(
      SessionNotFoundException,
    );
    expect(sessionRepository.findById).toHaveBeenCalledWith(dto.sessionId);
    expect(sessionRepository.addParticipant).not.toHaveBeenCalled();
  });
});
