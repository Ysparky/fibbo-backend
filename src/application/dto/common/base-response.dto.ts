export class BaseResponseDto {
  status: 'ok' | 'error';
  message?: string;
}
