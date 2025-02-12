import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { CreateSessionDto } from '../../application/dto/create-session.dto';
import { JoinSessionDto } from '../../application/dto/join-session.dto';
import { UpdateSessionDto } from '../../application/dto/update-session.dto';
import { CreateSessionUseCase } from '../../application/use-cases/session/create-session.use-case';
import { DeleteSessionUseCase } from '../../application/use-cases/session/delete-session.use-case';
import { GetSessionUseCase } from '../../application/use-cases/session/get-session.use-case';
import { JoinSessionUseCase } from '../../application/use-cases/session/join-session.use-case';
import { UpdateSessionUseCase } from '../../application/use-cases/session/update-session.use-case';
import { Session } from '../../core/entities/session.entity';
import { User } from '../../core/entities/user.entity';

@Controller('sessions')
export class SessionController {
  constructor(
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getSessionUseCase: GetSessionUseCase,
    private readonly updateSessionUseCase: UpdateSessionUseCase,
    private readonly deleteSessionUseCase: DeleteSessionUseCase,
    private readonly joinSessionUseCase: JoinSessionUseCase,
  ) {}

  @Post()
  async createSession(@Body() dto: CreateSessionDto): Promise<Session> {
    return this.createSessionUseCase.execute(dto);
  }

  @Get(':id')
  async getSession(@Param('id') id: string): Promise<Session> {
    return this.getSessionUseCase.execute(id);
  }

  @Put(':id')
  async updateSession(
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
  ): Promise<Session> {
    return this.updateSessionUseCase.execute(id, dto);
  }

  @Delete(':id')
  async deleteSession(@Param('id') id: string): Promise<void> {
    return this.deleteSessionUseCase.execute(id);
  }

  @Post('join')
  async joinSession(@Body() dto: JoinSessionDto): Promise<User> {
    return this.joinSessionUseCase.execute(dto);
  }
}
