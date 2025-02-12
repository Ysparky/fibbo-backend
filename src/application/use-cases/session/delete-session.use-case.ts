import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ISessionRepository } from '../../../core/interfaces/session.repository.interface';

@Injectable()
export class DeleteSessionUseCase {
  constructor(
    @Inject('ISessionRepository')
    private readonly sessionRepository: ISessionRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const session = await this.sessionRepository.findById(id);
    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    await this.sessionRepository.delete(id);
  }
}
