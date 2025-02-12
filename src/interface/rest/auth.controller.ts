import { Body, Controller, Post } from '@nestjs/common';
import { RegisterDto } from 'src/application/dto/auth/register.dto';
import { GetUserByNameUseCase } from 'src/application/use-cases/user/get-user-by-name.use-case';
import { LoginDto } from '../../application/dto/auth/login.dto';
import { AuthenticateUserUseCase } from '../../application/use-cases/auth/authenticate-user.use-case';
import { CreateUserUseCase } from '../../application/use-cases/user/create-user.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly getUserByNameUseCase: GetUserByNameUseCase,
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly authenticateUserUseCase: AuthenticateUserUseCase,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.createUserUseCase.execute(dto);
    const token = await this.authenticateUserUseCase.execute(user);

    return {
      user,
      token,
    };
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.getUserByNameUseCase.execute(dto.name);
    const token = await this.authenticateUserUseCase.execute(user);

    return {
      user,
      token,
    };
  }
}
