import { IsNotEmpty, IsUUID, ValidateIf } from 'class-validator';

export class ChangeCurrentTaskPayloadDto {
  @IsUUID()
  @IsNotEmpty()
  sessionId: string;

  @ValidateIf((o) => o.taskId !== null)
  @IsUUID()
  taskId: string | null;
}
