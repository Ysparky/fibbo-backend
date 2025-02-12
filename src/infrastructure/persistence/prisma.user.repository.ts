import { Injectable } from '@nestjs/common';
import { User } from 'src/core/entities/user.entity';
import { IUserRepository } from 'src/core/interfaces/repositories/user.repository.interface';
import { PrismaService } from './prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const createdUser = await this.prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
      },
    });

    return this.mapToEntity(createdUser);
  }

  async findByName(name: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { name },
    });

    return user ? this.mapToEntity(user) : null;
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user ? this.mapToEntity(user) : null;
  }

  private mapToEntity(prismaUser: any): User {
    return new User(prismaUser.id, prismaUser.name);
  }
}
