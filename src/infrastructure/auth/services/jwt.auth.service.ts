import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/core/interfaces/auth/jwt-payload.interface';
import { User } from '../../../core/entities/user.entity';
import { IAuthService } from '../../../core/interfaces/auth/auth.interface';

@Injectable()
export class JwtAuthService implements IAuthService {
  constructor(private readonly jwtService: JwtService) {}

  async generateToken(user: User): Promise<string> {
    const payload: JwtPayload = {
      id: user.id,
      name: user.name,
      role: user.role,
      sessionId: user.sessionId,
    };

    return this.jwtService.sign(payload);
  }

  async validateToken(token: string): Promise<boolean> {
    try {
      await this.jwtService.verify(token);
      return true;
    } catch {
      return false;
    }
  }

  async validateUser(payload: JwtPayload): Promise<boolean> {
    return !!(payload.id && payload.name && payload.role);
  }

  decode(token: string): JwtPayload {
    return this.jwtService.decode(token) as JwtPayload;
  }
}
