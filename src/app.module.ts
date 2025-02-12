import { Module } from '@nestjs/common';
import { CreateSessionUseCase } from './application/use-cases/session/create-session.use-case';
import { JoinSessionUseCase } from './application/use-cases/session/join-session.use-case';
import { CreateTaskUseCase } from './application/use-cases/task/create-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/task/delete-task.use-case';
import { GetTaskUseCase } from './application/use-cases/task/get-task.use-case';
import { GetTasksBySessionUseCase } from './application/use-cases/task/get-tasks-by-session.use-case';
import { UpdateTaskUseCase } from './application/use-cases/task/update-task.use-case';
import { PrismaService } from './infrastructure/persistence/prisma.service';
import { PrismaSessionRepository } from './infrastructure/persistence/prisma.session.repository';
import { PrismaTaskRepository } from './infrastructure/persistence/prisma.task.repository';
import { SessionGateway } from './infrastructure/websocket/session.gateway';
import { SessionController } from './interface/rest/session.controller';
import { TaskController } from './interface/rest/task.controller';

@Module({
  imports: [],
  controllers: [SessionController, TaskController],
  providers: [
    PrismaService,
    {
      provide: 'ISessionRepository',
      useClass: PrismaSessionRepository,
    },
    {
      provide: 'ITaskRepository',
      useClass: PrismaTaskRepository,
    },
    CreateSessionUseCase,
    JoinSessionUseCase,
    CreateTaskUseCase,
    GetTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    GetTasksBySessionUseCase,
    SessionGateway,
  ],
})
export class AppModule {}
