import { IsNotEmpty, IsUUID } from 'class-validator';
import { UpdateTaskDto } from './update-task.dto';

export class UpdateTaskPayloadDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsNotEmpty()
  update: UpdateTaskDto;
}
