import { DomainException } from './domain.exception';

export class UserNotFoundException extends DomainException {
  constructor(id: string) {
    super(`User with ID ${id} not found`, 'USER_NOT_FOUND');
  }
}

export class UserAlreadyExistsException extends DomainException {
  constructor(name: string) {
    super(`User with name ${name} already exists`, 'USER_ALREADY_EXISTS');
  }
}
