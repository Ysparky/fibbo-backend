import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class UpdateVoteDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  value: number;
}
