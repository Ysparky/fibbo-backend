import { Inject, Injectable } from '@nestjs/common';
import { SessionNotFoundException } from 'src/core/exceptions/session.exception';
import { ISessionRepository } from '../../../core/interfaces/repositories/session.repository.interface';

@Injectable()
export class DeleteSessionUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new SessionNotFoundException(id);
    }

    await this.sessionRepository.delete(id);
  }
}
