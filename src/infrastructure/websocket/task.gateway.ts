import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChangeCurrentTaskPayloadDto } from '../../application/dto/task/change-current-task-payload.dto';
import { CreateTaskDto } from '../../application/dto/task/create-task.dto';
import { DeleteTaskPayloadDto } from '../../application/dto/task/delete-task-payload.dto';
import {
  CurrentTaskChangedResponseDto,
  TaskDeletedResponseDto,
  TaskResponseDto,
  TaskUpdatedResponseDto,
} from '../../application/dto/task/task-response.dto';
import { UpdateTaskPayloadDto } from '../../application/dto/task/update-task-payload.dto';
import { WebSocketEvents } from '../../application/events/websocket.events';
import { ChangeCurrentTaskUseCase } from '../../application/use-cases/task/change-current-task.use-case';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/task/delete-task.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task.use-case';
import { UserRole } from '../../core/entities/session-user.entity';
import { Roles } from '../auth/decorators/roles.decorator';
import { WsAuthGuard } from '../auth/guards/ws-auth.guard';
import { WsRolesGuard } from '../auth/guards/ws-roles.guard';
import { WsCustomException } from './exceptions/ws-custom.exception';
import { WsExceptionFilter } from './filters/ws-exception.filter';
import { WsValidationPipe } from './pipes/ws-validation.pipe';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@UseGuards(WsAuthGuard, WsRolesGuard)
@UseFilters(WsExceptionFilter)
@UsePipes(new WsValidationPipe())
export class TaskGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly changeCurrentTaskUseCase: ChangeCurrentTaskUseCase,
  ) {}

  @SubscribeMessage(WebSocketEvents.TASK_CREATED)
  @Roles(UserRole.MODERATOR)
  async handleCreateTask(
    client: Socket,
    payload: CreateTaskDto,
  ): Promise<TaskResponseDto> {
    const task = await this.createTaskUseCase.execute(payload);

    const response: TaskResponseDto = {
      status: 'ok',
      task,
    };

    this.server
      .to(payload.sessionId)
      .emit(WebSocketEvents.TASK_CREATED, response);

    return response;
  }

  @SubscribeMessage(WebSocketEvents.TASK_UPDATED)
  @Roles(UserRole.MODERATOR)
  async handleUpdateTask(
    client: Socket,
    payload: UpdateTaskPayloadDto,
  ): Promise<TaskUpdatedResponseDto> {
    const task = await this.updateTaskUseCase.execute(
      payload.taskId,
      payload.update,
    );

    const response: TaskUpdatedResponseDto = {
      status: 'ok',
      task,
    };

    this.server.to(task.sessionId).emit(WebSocketEvents.TASK_UPDATED, response);

    return response;
  }

  @SubscribeMessage(WebSocketEvents.TASK_DELETED)
  @Roles(UserRole.MODERATOR)
  async handleDeleteTask(
    client: Socket,
    payload: DeleteTaskPayloadDto,
  ): Promise<TaskDeletedResponseDto> {
    await this.deleteTaskUseCase.execute(payload.taskId);

    const sessionId = Array.from(client.rooms).find(
      (room) => room !== client.id,
    );
    if (!sessionId) {
      throw new WsCustomException('Client not in any session', 'NO_SESSION');
    }

    const response: TaskDeletedResponseDto = {
      status: 'ok',
      taskId: payload.taskId,
    };

    this.server.to(sessionId).emit(WebSocketEvents.TASK_DELETED, response);

    return response;
  }

  @SubscribeMessage(WebSocketEvents.CURRENT_TASK_CHANGED)
  @Roles(UserRole.MODERATOR)
  async handleChangeCurrentTask(
    client: Socket,
    payload: ChangeCurrentTaskPayloadDto,
  ): Promise<CurrentTaskChangedResponseDto> {
    await this.changeCurrentTaskUseCase.execute(
      payload.sessionId,
      payload.taskId,
    );

    const response: CurrentTaskChangedResponseDto = {
      status: 'ok',
      taskId: payload.taskId,
    };

    this.server
      .to(payload.sessionId)
      .emit(WebSocketEvents.CURRENT_TASK_CHANGED, response);

    return response;
  }
}
