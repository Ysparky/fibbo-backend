import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/core/entities/session-user.entity';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
