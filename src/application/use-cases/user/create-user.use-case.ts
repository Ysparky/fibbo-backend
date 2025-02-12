import { Inject, Injectable } from '@nestjs/common';
import { RegisterDto } from 'src/application/dto/auth/register.dto';
import { User } from 'src/core/entities/user.entity';
import { UserAlreadyExistsException } from 'src/core/exceptions/user.exception';
import { IUserRepository } from 'src/core/interfaces/repositories/user.repository.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateUserUseCase {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(dto: RegisterDto): Promise<User> {
    const existingUser = await this.userRepository.findByName(dto.name);

    if (existingUser) {
      throw new UserAlreadyExistsException(dto.name);
    }

    const user = new User(uuidv4(), dto.name);
    return this.userRepository.create(user);
  }
}
