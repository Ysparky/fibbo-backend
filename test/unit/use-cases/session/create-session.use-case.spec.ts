import { Test } from '@nestjs/testing';
import { CreateSessionDto } from 'src/application/dto/session/create-session.dto';
import { CreateSessionUseCase } from 'src/application/use-cases/session/create-session.use-case';
import { Session } from 'src/core/entities/session.entity';
import { User, UserRole } from 'src/core/entities/user.entity';
import { ISessionRepository } from 'src/core/interfaces/repositories/session.repository.interface';

describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;
  let sessionRepository: ISessionRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CreateSessionUseCase,
        {
          provide: 'ISessionRepository',
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = moduleRef.get<CreateSessionUseCase>(CreateSessionUseCase);
    sessionRepository = moduleRef.get<ISessionRepository>('ISessionRepository');
  });

  it('should create a session with moderator', async () => {
    // Arrange
    const dto: CreateSessionDto = {
      name: 'Test Session',
      moderatorName: 'Test Moderator',
    };

    const expectedSession = new Session(
      expect.any(String),
      dto.name,
      expect.any(String),
    );
    expectedSession.participants = [
      new User(expect.any(String), dto.moderatorName, UserRole.MODERATOR),
    ];

    jest.spyOn(sessionRepository, 'create').mockResolvedValue(expectedSession);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result).toBeDefined();
    expect(result.name).toBe(dto.name);
    expect(result.moderatorId).toEqual(result.participants[0].id);
    expect(result.participants).toHaveLength(1);
    expect(result.participants[0].name).toBe(dto.moderatorName);
    expect(result.participants[0].role).toBe(UserRole.MODERATOR);
    expect(sessionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: dto.name,
        moderatorId: expect.any(String),
        participants: expect.arrayContaining([
          expect.objectContaining({
            name: dto.moderatorName,
            role: UserRole.MODERATOR,
          }),
        ]),
      }),
    );
  });
});
