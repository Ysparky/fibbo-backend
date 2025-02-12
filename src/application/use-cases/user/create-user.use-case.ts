import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../../core/entities/user.entity';
import { UserAlreadyExistsException } from '../../../core/exceptions/user.exception';
import { IUserRepository } from '../../../core/interfaces/repositories/user.repository.interface';
import { CreateUserDto } from '../../dto/user/create-user.dto';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(dto: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findByName(dto.name);

    if (existingUser) {
      throw new UserAlreadyExistsException(dto.name);
    }

    const user = new User(uuidv4(), dto.name);
    return this.userRepository.create(user);
  }
}
