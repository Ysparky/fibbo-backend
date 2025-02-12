import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdateVoteDto {
  @IsNumber()
  @IsNotEmpty()
  value: number;
}
