import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateSessionDto } from '../../application/dto/session/create-session.dto';
import { UpdateSessionDto } from '../../application/dto/session/update-session.dto';
import { CreateTaskDto } from '../../application/dto/task/create-task.dto';
import { CreateSessionUseCase } from '../../application/use-cases/session/create-session.use-case';
import { DeleteSessionUseCase } from '../../application/use-cases/session/delete-session.use-case';
import { GetSessionUseCase } from '../../application/use-cases/session/get-session.use-case';
import { UpdateSessionUseCase } from '../../application/use-cases/session/update-session.use-case';
import { UserRole } from '../../core/entities/session-user.entity';
import { Session } from '../../core/entities/session.entity';
import { Roles } from '../../infrastructure/auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';
import { SessionRoleGuard } from '../../infrastructure/auth/guards/session-role.guard';

@Controller('sessions')
export class SessionController {
  constructor(
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getSessionUseCase: GetSessionUseCase,
    private readonly updateSessionUseCase: UpdateSessionUseCase,
    private readonly deleteSessionUseCase: DeleteSessionUseCase,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createSession(
    @Body() dto: CreateSessionDto,
    @Request() req,
  ): Promise<Session> {
    // Ensure only moderators can create sessions
    if (req.user.role !== UserRole.MODERATOR) {
      throw new UnauthorizedException('Only moderators can create sessions');
    }

    return this.createSessionUseCase.execute({
      ...dto,
      moderatorId: req.user.id,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getSession(@Param('id') id: string): Promise<Session> {
    return this.getSessionUseCase.execute(id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  updateSession(
    @Param('id') id: string,
    @Body() dto: UpdateSessionDto,
    @Request() req,
  ): Promise<Session> {
    // Only moderator can update session
    if (req.user.role !== 'MODERATOR') {
      throw new UnauthorizedException('Only moderator can update session');
    }
    return this.updateSessionUseCase.execute(id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  deleteSession(@Param('id') id: string, @Request() req): Promise<void> {
    // Only moderator can delete session
    if (req.user.role !== 'MODERATOR') {
      throw new UnauthorizedException('Only moderator can delete session');
    }
    return this.deleteSessionUseCase.execute(id);
  }

  @Post(':sessionId/tasks')
  @UseGuards(JwtAuthGuard, SessionRoleGuard)
  @Roles(UserRole.MODERATOR)
  async createTask(
    @Param('sessionId') sessionId: string,
    @Body() dto: CreateTaskDto,
  ) {
    // ... implementation
  }
}
