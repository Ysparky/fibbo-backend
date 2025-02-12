import { Session } from '../../../core/entities/session.entity';
import { BaseResponseDto } from '../common/base-response.dto';

export class SessionResponseDto extends BaseResponseDto {
  session: Session;
}

export class SessionWithTokenResponseDto extends BaseResponseDto {
  session: Session;
  token: string;
}

export class JoinSessionResponseDto extends BaseResponseDto {
  participant: {
    id: string;
    name: string;
    role: string;
  };
  token: string;
}

export class WsJoinSessionResponseDto extends BaseResponseDto {
  participant: {
    id: string;
    name: string;
    role: string;
  };
}

export class WsLeaveSessionResponseDto extends BaseResponseDto {}

export class WsVotingStateResponseDto extends BaseResponseDto {}
