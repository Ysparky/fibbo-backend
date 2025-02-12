import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { GetUserSessionRoleUseCase } from 'src/application/use-cases/auth/get-user-session-role.use-case';
import { PrismaService } from '../persistence/prisma.service';
import { PrismaSessionUserRepository } from '../persistence/prisma.session-user.repository';
import { JwtAuthService } from './services/jwt.auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '24h',
        },
      }),
    }),
  ],
  providers: [
    {
      provide: 'IAuthService',
      useClass: JwtAuthService,
    },
    {
      provide: 'ISessionUserRepository',
      useClass: PrismaSessionUserRepository,
    },
    JwtStrategy,
    PrismaService,
    GetUserSessionRoleUseCase,
  ],
  exports: [
    'IAuthService',
    'ISessionUserRepository',
    GetUserSessionRoleUseCase,
  ],
})
export class AuthModule {}
