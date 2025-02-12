import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteTaskPayloadDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;
}
