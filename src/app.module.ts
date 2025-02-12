import { Module } from '@nestjs/common';
import { CreateSessionUseCase } from './application/use-cases/session/create-session.use-case';
import { JoinSessionUseCase } from './application/use-cases/session/join-session.use-case';
import { CreateTaskUseCase } from './application/use-cases/task/create-task.use-case';
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
    SessionGateway,
  ],
})
export class AppModule {}
