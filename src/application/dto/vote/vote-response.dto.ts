import { Vote } from '../../../core/entities/vote.entity';
import { BaseResponseDto } from '../common/base-response.dto';

export class VoteResponseDto extends BaseResponseDto {
  vote: Vote;
}

export class VoteListResponseDto extends BaseResponseDto {
  votes: Vote[];
}

export class VoteSubmittedResponseDto extends BaseResponseDto {
  userId: string;
  taskId: string;
  value: number;
}

export class VoteRevealedResponseDto extends BaseResponseDto {
  votes: Vote[];
}

export class VoteUpdatedResponseDto extends BaseResponseDto {
  vote: Vote;
}
