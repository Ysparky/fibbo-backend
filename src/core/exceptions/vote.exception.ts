import { DomainException } from './domain.exception';

export class VoteNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Vote with ID ${id} not found`, 'VOTE_NOT_FOUND');
  }
}

export class VoteAccessDeniedException extends DomainException {
  constructor() {
    super('Access to vote denied', 'VOTE_ACCESS_DENIED');
  }
}

export class VoteOperationException extends DomainException {
  constructor(message: string) {
    super(message, 'VOTE_OPERATION_ERROR');
  }
}
