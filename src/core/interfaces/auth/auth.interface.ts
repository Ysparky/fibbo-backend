import { User } from '../../entities/user.entity';

export interface IAuthService {
  generateToken(user: User): Promise<string>;
  validateToken(token: string): Promise<boolean>;
  validateUser(payload: any): Promise<boolean>;
}
