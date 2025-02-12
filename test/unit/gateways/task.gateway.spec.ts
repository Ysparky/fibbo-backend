import { Test } from '@nestjs/testing';
import { Server, Socket } from 'socket.io';
import { ChangeCurrentTaskPayloadDto } from 'src/application/dto/task/change-current-task-payload.dto';
import { CreateTaskDto } from 'src/application/dto/task/create-task.dto';
import { DeleteTaskPayloadDto } from 'src/application/dto/task/delete-task-payload.dto';
import { UpdateTaskPayloadDto } from 'src/application/dto/task/update-task-payload.dto';
import { ChangeCurrentTaskUseCase } from 'src/application/use-cases/task/change-current-task.use-case';
import { CreateTaskUseCase } from 'src/application/use-cases/task/create-task.use-case';
import { DeleteTaskUseCase } from 'src/application/use-cases/task/delete-task.use-case';
import { UpdateTaskUseCase } from 'src/application/use-cases/task/update-task.use-case';
import { Task } from 'src/core/entities/task.entity';
import { WsAuthGuard } from 'src/infrastructure/auth/guards/ws-auth.guard';
import { WsRolesGuard } from 'src/infrastructure/auth/guards/ws-roles.guard';
import { TaskGateway } from 'src/infrastructure/websocket/task.gateway';

describe('TaskGateway', () => {
  let gateway: TaskGateway;
  let createTaskUseCase: CreateTaskUseCase;
  let updateTaskUseCase: UpdateTaskUseCase;
  let deleteTaskUseCase: DeleteTaskUseCase;
  let changeCurrentTaskUseCase: ChangeCurrentTaskUseCase;

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
    rooms: new Set(['session-id']),
  } as unknown as Socket;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TaskGateway,
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
        {
          provide: ChangeCurrentTaskUseCase,
          useValue: { execute: jest.fn() },
        },
      ],
    })
      .overrideGuard(WsAuthGuard)
      .useValue({ canActivate: jest.fn() })
      .overrideGuard(WsRolesGuard)
      .useValue({ canActivate: jest.fn() })
      .compile();

    gateway = moduleRef.get<TaskGateway>(TaskGateway);
    createTaskUseCase = moduleRef.get<CreateTaskUseCase>(CreateTaskUseCase);
    updateTaskUseCase = moduleRef.get<UpdateTaskUseCase>(UpdateTaskUseCase);
    deleteTaskUseCase = moduleRef.get<DeleteTaskUseCase>(DeleteTaskUseCase);
    changeCurrentTaskUseCase = moduleRef.get<ChangeCurrentTaskUseCase>(
      ChangeCurrentTaskUseCase,
    );

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

  describe('handleCreateTask', () => {
    it('should create task and notify session participants', async () => {
      // Arrange
      const dto: CreateTaskDto = {
        title: 'Test Task',
        description: 'Test Description',
        sessionId: 'session-id',
      };
      const task = new Task(
        'task-id',
        dto.title,
        dto.description,
        dto.sessionId,
      );

      jest.spyOn(createTaskUseCase, 'execute').mockResolvedValue(task);

      // Act
      const result = await gateway.handleCreateTask(mockSocket, dto);

      // Assert
      expect(createTaskUseCase.execute).toHaveBeenCalledWith(dto);
      expect(gateway.server.to).toHaveBeenCalledWith(dto.sessionId);
      expect(gateway.server.emit).toHaveBeenCalledWith('taskCreated', {
        status: 'ok',
        task,
      });
      expect(result).toEqual({ status: 'ok', task });
    });
  });

  describe('handleUpdateTask', () => {
    it('should update task and notify session participants', async () => {
      // Arrange
      const taskId = 'task-id';
      const update = {
        title: 'Updated Task',
        description: 'Updated Description',
      };
      const dto: UpdateTaskPayloadDto = { taskId, update };
      const task = new Task(
        taskId,
        'New Title',
        'New Description',
        'session-id',
      );

      jest.spyOn(updateTaskUseCase, 'execute').mockResolvedValue(task);

      // Act
      const result = await gateway.handleUpdateTask(mockSocket, dto);

      // Assert
      expect(updateTaskUseCase.execute).toHaveBeenCalledWith(taskId, update);
      expect(gateway.server.to).toHaveBeenCalledWith(task.sessionId);
      expect(gateway.server.emit).toHaveBeenCalledWith('taskUpdated', {
        status: 'ok',
        task,
      });
      expect(result).toEqual({ status: 'ok', task });
    });
  });

  describe('handleDeleteTask', () => {
    it('should delete task and notify session participants', async () => {
      // Arrange
      const dto: DeleteTaskPayloadDto = { taskId: 'task-id' };

      jest.spyOn(deleteTaskUseCase, 'execute').mockResolvedValue();

      // Act
      const result = await gateway.handleDeleteTask(mockSocket, dto);

      // Assert
      expect(deleteTaskUseCase.execute).toHaveBeenCalledWith(dto.taskId);
      expect(gateway.server.to).toHaveBeenCalledWith(
        mockSocket.rooms.values().next().value,
      );
      expect(gateway.server.emit).toHaveBeenCalledWith('taskDeleted', {
        status: 'ok',
        taskId: dto.taskId,
      });
      expect(result).toEqual({ status: 'ok', taskId: dto.taskId });
    });
  });

  describe('handleChangeCurrentTask', () => {
    it('should change current task and notify session participants', async () => {
      // Arrange
      const dto: ChangeCurrentTaskPayloadDto = {
        taskId: 'task-id',
        sessionId: 'session-id',
      };

      jest.spyOn(changeCurrentTaskUseCase, 'execute').mockResolvedValue();

      // Act
      const result = await gateway.handleChangeCurrentTask(mockSocket, dto);

      // Assert
      expect(changeCurrentTaskUseCase.execute).toHaveBeenCalledWith(
        dto.sessionId,
        dto.taskId,
      );
      expect(gateway.server.to).toHaveBeenCalledWith(dto.sessionId);
      expect(gateway.server.emit).toHaveBeenCalledWith('currentTaskChanged', {
        status: 'ok',
        taskId: dto.taskId,
      });
      expect(result).toEqual({ status: 'ok', taskId: dto.taskId });
    });
  });
});
