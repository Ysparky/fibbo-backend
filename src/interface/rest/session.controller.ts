import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Post,
  Put,
  Request,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { CreateSessionDto } from '../../application/dto/session/create-session.dto';
import { JoinSessionDto } from '../../application/dto/session/join-session.dto';
import { UpdateSessionDto } from '../../application/dto/session/update-session.dto';
import { CreateSessionUseCase } from '../../application/use-cases/session/create-session.use-case';
import { DeleteSessionUseCase } from '../../application/use-cases/session/delete-session.use-case';
import { GetSessionUseCase } from '../../application/use-cases/session/get-session.use-case';
import { JoinSessionUseCase } from '../../application/use-cases/session/join-session.use-case';
import { UpdateSessionUseCase } from '../../application/use-cases/session/update-session.use-case';
import { Session } from '../../core/entities/session.entity';
import { IAuthService } from '../../core/interfaces/auth/auth.interface';
import { JwtAuthGuard } from '../../infrastructure/auth/guards/jwt-auth.guard';

@Controller('sessions')
export class SessionController {
  constructor(
    private readonly createSessionUseCase: CreateSessionUseCase,
    private readonly getSessionUseCase: GetSessionUseCase,
    private readonly updateSessionUseCase: UpdateSessionUseCase,
    private readonly deleteSessionUseCase: DeleteSessionUseCase,
    private readonly joinSessionUseCase: JoinSessionUseCase,
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  @Post()
  async createSession(@Body() dto: CreateSessionDto) {
    const session = await this.createSessionUseCase.execute(dto);
    const moderator = session.participants.find(
      (p) => p.id === session.moderatorId,
    );
    const token = await this.authService.generateToken(moderator);

    return {
      session,
      token,
    };
  }

  @Post('join')
  async joinSession(@Body() dto: JoinSessionDto) {
    const participant = await this.joinSessionUseCase.execute(dto);
    const token = await this.authService.generateToken(participant);

    return {
      participant,
      token,
    };
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
}
