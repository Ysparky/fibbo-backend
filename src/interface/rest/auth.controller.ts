import { Body, Controller, Post } from '@nestjs/common';
import { AuthResponseDto } from 'src/application/dto/auth/auth-response.dto';
import { LoginDto } from 'src/application/dto/auth/login.dto';
import { RegisterDto } from 'src/application/dto/auth/register.dto';
import { AuthenticateUserUseCase } from 'src/application/use-cases/auth/authenticate-user.use-case';
import { CreateUserUseCase } from 'src/application/use-cases/user/create-user.use-case';
import { GetUserByNameUseCase } from 'src/application/use-cases/user/get-user-by-name.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly getUserByNameUseCase: GetUserByNameUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.createUserUseCase.execute(dto);
    const token = await this.authenticateUserUseCase.execute(user);

    return {
      user,
      token,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.getUserByNameUseCase.execute(dto.name);
    const token = await this.authenticateUserUseCase.execute(user);

    return {
      user,
      token,
    };
  }
}
