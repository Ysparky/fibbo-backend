import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SubmitVoteDto {
  @IsString()
  @IsNotEmpty()
  taskId: string;

  @IsNumber()
  @IsNotEmpty()
  value: number;
}
