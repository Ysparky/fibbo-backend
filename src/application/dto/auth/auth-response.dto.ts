import { User } from 'src/core/entities/user.entity';

export class AuthResponseDto {
  user: User;
  token: string;
}
