import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateSessionDto } from '../../application/dto/create-session.dto';
import { JoinSessionDto } from '../../application/dto/join-session.dto';
import { CreateSessionUseCase } from '../../application/use-cases/session/create-session.use-case';
import { JoinSessionUseCase } from '../../application/use-cases/session/join-session.use-case';
import { Session } from '../../core/entities/session.entity';
import { User } from '../../core/entities/user.entity';

@Controller('sessions')
export class SessionController {
  constructor(
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly joinSessionUseCase: JoinSessionUseCase,
  ) {}

  @Post()
  async createSession(@Body() dto: CreateSessionDto): Promise<Session> {
    return this.createSessionUseCase.execute(dto);
  }

  @Post('join')
  async joinSession(@Body() dto: JoinSessionDto): Promise<User> {
    return this.joinSessionUseCase.execute(dto);
  }

  @Get(':id')
  async getSession(@Param('id') id: string): Promise<Session> {
    // TODO: Implement get session use case
    throw new Error('Not implemented');
  }
}
