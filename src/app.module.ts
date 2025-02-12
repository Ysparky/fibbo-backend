import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CreateSessionUseCase } from './application/use-cases/session/create-session.use-case';
import { DeleteSessionUseCase } from './application/use-cases/session/delete-session.use-case';
import { GetSessionUseCase } from './application/use-cases/session/get-session.use-case';
import { HandleDisconnectUseCase } from './application/use-cases/session/handle-disconnect.use-case';
import { HandleReconnectUseCase } from './application/use-cases/session/handle-reconnect.use-case';
import { JoinSessionUseCase } from './application/use-cases/session/join-session.use-case';
import { UpdateSessionUseCase } from './application/use-cases/session/update-session.use-case';
import { CreateTaskUseCase } from './application/use-cases/task/create-task.use-case';
import { DeleteTaskUseCase } from './application/use-cases/task/delete-task.use-case';
import { GetTaskUseCase } from './application/use-cases/task/get-task.use-case';
import { GetTasksBySessionUseCase } from './application/use-cases/task/get-tasks-by-session.use-case';
import { UpdateTaskUseCase } from './application/use-cases/task/update-task.use-case';
import { GetTaskVotesUseCase } from './application/use-cases/vote/get-task-votes.use-case';
import { GetUserVotesUseCase } from './application/use-cases/vote/get-user-votes.use-case';
import { SubmitVoteUseCase } from './application/use-cases/vote/submit-vote.use-case';
import { UpdateVoteUseCase } from './application/use-cases/vote/update-vote.use-case';
import { AuthModule } from './infrastructure/auth/auth.module';
import { PrismaService } from './infrastructure/persistence/prisma.service';
import { PrismaSessionRepository } from './infrastructure/persistence/prisma.session.repository';
import { PrismaTaskRepository } from './infrastructure/persistence/prisma.task.repository';
import { PrismaVoteRepository } from './infrastructure/persistence/prisma.vote.repository';
import { SessionGateway } from './infrastructure/websocket/session.gateway';
import { SessionController } from './interface/rest/session.controller';
import { TaskController } from './interface/rest/task.controller';
import { VoteController } from './interface/rest/vote.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
  ],
  controllers: [SessionController, TaskController, VoteController],
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
    {
      provide: 'IVoteRepository',
      useClass: PrismaVoteRepository,
    },
    // Session Use Cases
    CreateSessionUseCase,
    GetSessionUseCase,
    UpdateSessionUseCase,
    DeleteSessionUseCase,
    JoinSessionUseCase,
    HandleDisconnectUseCase,
    HandleReconnectUseCase,
    // Task Use Cases
    CreateTaskUseCase,
    GetTaskUseCase,
    UpdateTaskUseCase,
    DeleteTaskUseCase,
    GetTasksBySessionUseCase,
    // Vote Use Cases
    SubmitVoteUseCase,
    GetTaskVotesUseCase,
    UpdateVoteUseCase,
    GetUserVotesUseCase,
    // WebSocket Gateway
    SessionGateway,
  ],
})
export class AppModule {}
