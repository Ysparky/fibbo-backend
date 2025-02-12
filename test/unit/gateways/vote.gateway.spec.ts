import { Test } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { SubmitVoteDto } from 'src/application/dto/vote/submit-vote.dto';
import { UpdateVotePayloadDto } from 'src/application/dto/vote/update-vote-payload.dto';
import { GetTaskVotesUseCase } from 'src/application/use-cases/vote/get-task-votes.use-case';
import { SubmitVoteUseCase } from 'src/application/use-cases/vote/submit-vote.use-case';
import { UpdateVoteUseCase } from 'src/application/use-cases/vote/update-vote.use-case';
import { Vote } from 'src/core/entities/vote.entity';
import { WsAuthGuard } from 'src/infrastructure/auth/guards/ws-auth.guard';
import { WsSessionRoleGuard } from 'src/infrastructure/auth/guards/ws-roles.guard';
import { VoteGateway } from 'src/infrastructure/websocket/vote.gateway';

describe('VoteGateway', () => {
  let gateway: VoteGateway;
  let submitVoteUseCase: SubmitVoteUseCase;
  let updateVoteUseCase: UpdateVoteUseCase;
  let getTaskVotesUseCase: GetTaskVotesUseCase;

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
    rooms: new Set(['task-id']),
  } as unknown as Socket;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        VoteGateway,
        {
          provide: SubmitVoteUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: UpdateVoteUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: GetTaskVotesUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(WsAuthGuard)
      .useValue({ canActivate: jest.fn() })
      .overrideGuard(WsSessionRoleGuard)
      .useValue({ canActivate: jest.fn() })
      .compile();

    gateway = moduleRef.get<VoteGateway>(VoteGateway);
    submitVoteUseCase = moduleRef.get<SubmitVoteUseCase>(SubmitVoteUseCase);
    updateVoteUseCase = moduleRef.get<UpdateVoteUseCase>(UpdateVoteUseCase);
    getTaskVotesUseCase =
      moduleRef.get<GetTaskVotesUseCase>(GetTaskVotesUseCase);

    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock WebSocket Server
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

  describe('handleSubmitVote', () => {
    it('should submit vote and notify task participants', async () => {
      // Arrange
      const dto: SubmitVoteDto = {
        taskId: 'task-id',
        value: 5,
      };
      const vote = new Vote(
        'vote-id',
        mockSocket.data.user.id,
        dto.taskId,
        dto.value,
      );

      jest.spyOn(submitVoteUseCase, 'execute').mockResolvedValue(vote);

      // Act
      const result = await gateway.handleSubmitVote(mockSocket, dto);

      // Assert
      expect(submitVoteUseCase.execute).toHaveBeenCalledWith(
        mockSocket.data.user.id,
        dto,
      );
      expect(gateway.server.to).toHaveBeenCalledWith(dto.taskId);
      expect(gateway.server.emit).toHaveBeenCalledWith('voteSubmitted', {
        status: 'ok',
        userId: mockSocket.data.user.id,
        taskId: dto.taskId,
        value: dto.value,
      });
      expect(result).toEqual({ status: 'ok', vote });
    });
  });

  describe('handleUpdateVote', () => {
    it('should update vote and notify task participants', async () => {
      // Arrange
      const dto: UpdateVotePayloadDto = {
        voteId: 'vote-id',
        value: 8,
      };
      const vote = new Vote(
        'vote-id',
        mockSocket.data.user.id,
        'task-id',
        dto.value,
      );

      jest.spyOn(updateVoteUseCase, 'execute').mockResolvedValue(vote);

      // Act
      const result = await gateway.handleUpdateVote(mockSocket, dto);

      // Assert
      expect(updateVoteUseCase.execute).toHaveBeenCalledWith(
        dto.voteId,
        mockSocket.data.user.id,
        { value: dto.value },
      );
      expect(gateway.server.to).toHaveBeenCalledWith(vote.taskId);
      expect(gateway.server.emit).toHaveBeenCalledWith('voteUpdated', {
        voteId: vote.id,
        userId: vote.userId,
        value: vote.value,
      });
      expect(result).toEqual({ status: 'ok', vote });
    });
  });

  describe('handleRevealVotes', () => {
    it('should reveal votes and notify task participants', async () => {
      // Arrange
      const taskId = 'task-id';
      const votes = [
        new Vote('vote-1', 'user-1', taskId, 5),
        new Vote('vote-2', 'user-2', taskId, 8),
      ];

      jest.spyOn(getTaskVotesUseCase, 'execute').mockResolvedValue(votes);

      // Act
      const result = await gateway.handleRevealVotes(mockSocket, taskId);

      // Assert
      expect(getTaskVotesUseCase.execute).toHaveBeenCalledWith(taskId);
      expect(gateway.server.to).toHaveBeenCalledWith(taskId);
      expect(gateway.server.emit).toHaveBeenCalledWith('votesRevealed', {
        votes,
      });
      expect(result).toEqual({ status: 'ok', votes });
    });
  });
});
