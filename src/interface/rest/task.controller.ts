import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateTaskDto } from '../../application/dto/create-task.dto';
import { UpdateTaskDto } from '../../application/dto/update-task.dto';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task.use-case';
import { DeleteTaskUseCase } from '../../application/use-cases/task/delete-task.use-case';
import { GetTaskUseCase } from '../../application/use-cases/task/get-task.use-case';
import { GetTasksBySessionUseCase } from '../../application/use-cases/task/get-tasks-by-session.use-case';
import { UpdateTaskUseCase } from '../../application/use-cases/task/update-task.use-case';
import { Task } from '../../core/entities/task.entity';
import { UserRole } from '../../core/entities/user.entity';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/auth/guards/roles.guard';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
    private readonly updateTaskUseCase: UpdateTaskUseCase,
    private readonly deleteTaskUseCase: DeleteTaskUseCase,
    private readonly getTasksBySessionUseCase: GetTasksBySessionUseCase,
  ) {}

  @Post()
  @Roles(UserRole.MODERATOR)
  async createTask(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.createTaskUseCase.execute(dto);
  }

  @Get(':id')
  async getTask(@Param('id') id: string): Promise<Task> {
    return this.getTaskUseCase.execute(id);
  }

  @Put(':id')
  @Roles(UserRole.MODERATOR)
  async updateTask(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.updateTaskUseCase.execute(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.MODERATOR)
  async deleteTask(@Param('id') id: string): Promise<void> {
    return this.deleteTaskUseCase.execute(id);
  }

  @Get('session/:sessionId')
  async getTasksBySession(
    @Param('sessionId') sessionId: string,
  ): Promise<Task[]> {
    return this.getTasksBySessionUseCase.execute(sessionId);
  }
}
