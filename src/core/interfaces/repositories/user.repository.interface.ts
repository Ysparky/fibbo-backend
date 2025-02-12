import { User } from '../../entities/user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByName(name: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
