import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateTaskDto } from '../../application/dto/create-task.dto';
import { CreateTaskUseCase } from '../../application/use-cases/task/create-task.use-case';
import { GetTaskUseCase } from '../../application/use-cases/task/get-task.use-case';
import { Task } from '../../core/entities/task.entity';

@Controller('tasks')
export class TaskController {
  constructor(
    private readonly createTaskUseCase: CreateTaskUseCase,
    private readonly getTaskUseCase: GetTaskUseCase,
  ) {}

  @Post()
  async createTask(@Body() dto: CreateTaskDto): Promise<Task> {
    return this.createTaskUseCase.execute(dto);
  }

  @Get(':id')
  async getTask(@Param('id') id: string): Promise<Task> {
    return this.getTaskUseCase.execute(id);
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() task: Task): Promise<Task> {
    // TODO: Implement update task use case
    throw new Error('Not implemented');
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string): Promise<void> {
    // TODO: Implement delete task use case
    throw new Error('Not implemented');
  }

  @Get('session/:sessionId')
  async getTasksBySession(
    @Param('sessionId') sessionId: string,
  ): Promise<Task[]> {
    // TODO: Implement get tasks by session use case
    throw new Error('Not implemented');
  }
}
