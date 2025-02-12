import { User } from '../../entities/user.entity';
import { JwtPayload } from './jwt-payload.interface';

export interface IAuthService {
  generateToken(user: User): Promise<string>;
  validateToken(token: string): Promise<boolean>;
  validateUser(payload: any): Promise<boolean>;
  decode(token: string): JwtPayload;
}
