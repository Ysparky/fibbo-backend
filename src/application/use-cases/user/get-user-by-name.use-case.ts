import { Injectable } from '@nestjs/common';
import { User } from '../../../core/entities/user.entity';
import { UserNotFoundException } from '../../../core/exceptions/user.exception';
import { IUserRepository } from '../../../core/interfaces/repositories/user.repository.interface';

@Injectable()
export class GetUserByNameUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(name: string): Promise<User> {
    const user = await this.userRepository.findByName(name);

    if (!user) {
      throw new UserNotFoundException(name);
    }

    return user;
  }
}
