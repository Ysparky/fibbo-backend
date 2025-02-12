import { DomainException } from './domain.exception';

export class SessionNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Session with ID ${id} not found`, 'SESSION_NOT_FOUND');
  }
}

export class SessionAccessDeniedException extends DomainException {
  constructor() {
    super('Access to session denied', 'SESSION_ACCESS_DENIED');
  }
}

export class InvalidSessionStateException extends DomainException {
  constructor(message: string) {
    super(message, 'INVALID_SESSION_STATE');
  }
}
