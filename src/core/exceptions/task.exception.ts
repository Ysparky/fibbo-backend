import { DomainException } from './domain.exception';

export class TaskNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Task with ID ${id} not found`, 'TASK_NOT_FOUND');
  }
}

export class TaskValidationException extends DomainException {
  constructor(message: string) {
    super(message, 'TASK_VALIDATION_ERROR');
  }
}

export class TaskOperationException extends DomainException {
  constructor(message: string) {
    super(message, 'TASK_OPERATION_ERROR');
  }
}
