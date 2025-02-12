import { IsNotEmpty, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class SubmitVoteDto {
  @IsUUID()
  @IsNotEmpty()
  taskId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  value: number;
}
