import { Test } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { JoinSessionDto } from 'src/application/dto/session/join-session.dto';
import { HandleDisconnectUseCase } from 'src/application/use-cases/session-user/handle-disconnect.use-case';
import { JoinSessionUseCase } from 'src/application/use-cases/session-user/join-session.use-case';
import { HandleReconnectUseCase } from 'src/application/use-cases/session/handle-reconnect.use-case';
import { UpdateSessionUseCase } from 'src/application/use-cases/session/update-session.use-case';
import { ChangeCurrentTaskUseCase } from 'src/application/use-cases/task/change-current-task.use-case';
import { CreateTaskUseCase } from 'src/application/use-cases/task/create-task.use-case';
import { DeleteTaskUseCase } from 'src/application/use-cases/task/delete-task.use-case';
import { UpdateTaskUseCase } from 'src/application/use-cases/task/update-task.use-case';
import { GetTaskVotesUseCase } from 'src/application/use-cases/vote/get-task-votes.use-case';
import { SubmitVoteUseCase } from 'src/application/use-cases/vote/submit-vote.use-case';
import { UpdateVoteUseCase } from 'src/application/use-cases/vote/update-vote.use-case';
import { User, UserRole } from 'src/core/entities/user.entity';
import { WsAuthGuard } from 'src/infrastructure/auth/guards/ws-auth.guard';
import { WsSessionRoleGuard } from 'src/infrastructure/auth/guards/ws-roles.guard';
import { SessionGateway } from 'src/infrastructure/websocket/session.gateway';

describe('SessionGateway', () => {
  let gateway: SessionGateway;
  let joinSessionUseCase: JoinSessionUseCase;
  let handleDisconnectUseCase: HandleDisconnectUseCase;
  let handleReconnectUseCase: HandleReconnectUseCase;

  const mockSocket = {
    id: 'socket-id',
    data: {
      user: {
        id: 'user-id',
      },
    },
    join: jest.fn(),
    leave: jest.fn(),
    emit: jest.fn(),
    to: jest.fn().mockReturnThis(),
    broadcast: {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    },
    rooms: new Set(['room-1']),
  } as unknown as Socket;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SessionGateway,
        {
          provide: JoinSessionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateSessionUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: SubmitVoteUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetTaskVotesUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateVoteUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: HandleDisconnectUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: HandleReconnectUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: ChangeCurrentTaskUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: CreateTaskUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateTaskUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: DeleteTaskUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(WsAuthGuard)
      .useValue({ canActivate: jest.fn() })
      .overrideGuard(WsSessionRoleGuard)
      .useValue({ canActivate: jest.fn() })
      .compile();

    gateway = moduleRef.get<SessionGateway>(SessionGateway);
    handleReconnectUseCase = moduleRef.get<HandleReconnectUseCase>(
      HandleReconnectUseCase,
    );
    handleDisconnectUseCase = moduleRef.get<HandleDisconnectUseCase>(
      HandleDisconnectUseCase,
    );
    joinSessionUseCase = moduleRef.get<JoinSessionUseCase>(JoinSessionUseCase);

    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock WebSocket Server more completely
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
      sockets: {
        adapter: {
          rooms: new Map(),
        },
      },
    } as unknown as Server;
  });

  describe('handleConnection', () => {
    it('should handle client connection and attempt reconnection', async () => {
      // Arrange
      const sessionId = 'test-session-id';
      jest
        .spyOn(handleReconnectUseCase, 'execute')
        .mockResolvedValue(sessionId);

      // Act
      await gateway.handleConnection(mockSocket);

      // Assert
      expect(handleReconnectUseCase.execute).toHaveBeenCalledWith(
        mockSocket.data.user.id,
      );
      expect(mockSocket.join).toHaveBeenCalledWith(sessionId);
    });

    it('should not join room if no previous session found', async () => {
      // Arrange
      jest.spyOn(handleReconnectUseCase, 'execute').mockResolvedValue(null);

      // Act
      await gateway.handleConnection(mockSocket);

      // Assert
      expect(handleReconnectUseCase.execute).toHaveBeenCalledWith(
        mockSocket.data.user.id,
      );
      expect(mockSocket.join).not.toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('should handle client disconnection', async () => {
      // Arrange
      const result = {
        sessionId: 'test-session-id',
        userId: mockSocket.data.user.id,
      };
      jest.spyOn(handleDisconnectUseCase, 'execute').mockResolvedValue(result);

      // Act
      await gateway.handleDisconnect(mockSocket);

      // Assert
      expect(handleDisconnectUseCase.execute).toHaveBeenCalledWith(
        mockSocket.data.user.id,
        false,
      );
      expect(gateway.server.to).toHaveBeenCalledWith(result.sessionId);
      expect(gateway.server.emit).toHaveBeenCalledWith('userLeft', {
        userId: result.userId,
      });
    });
  });

  describe('handleJoinSession', () => {
    it('should join session and notify other participants', async () => {
      // Arrange
      const dto: JoinSessionDto = {
        sessionId: 'test-session-id',
        participantName: 'Test Participant',
      };
      const user = new User(
        mockSocket.data.user.id,
        dto.participantName,
        UserRole.PARTICIPANT,
      );

      jest.spyOn(joinSessionUseCase, 'execute').mockResolvedValue(user);

      // Act
      const result = await gateway.handleJoinSession(mockSocket, dto);

      // Assert
      expect(joinSessionUseCase.execute).toHaveBeenCalledWith(dto);
      expect(mockSocket.join).toHaveBeenCalledWith(dto.sessionId);
      expect(gateway.server.to).toHaveBeenCalledWith(dto.sessionId);
      expect(gateway.server.emit).toHaveBeenCalledWith('userJoined', {
        userId: user.id,
        name: user.name,
        role: user.role,
      });
      expect(result.participant).toEqual(user);
    });
  });
});
