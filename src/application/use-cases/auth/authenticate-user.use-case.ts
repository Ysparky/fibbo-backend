import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../core/entities/user.entity';
import { IAuthService } from '../../../core/interfaces/auth/auth.interface';

@Injectable()
export class AuthenticateUserUseCase {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,
  ) {}

  async execute(user: User): Promise<string> {
    return this.authService.generateToken(user);
  }
}
