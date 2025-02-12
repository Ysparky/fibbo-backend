import { IsNotEmpty, IsNumber, IsUUID, Max, Min } from 'class-validator';

export class UpdateVotePayloadDto {
  @IsUUID()
  @IsNotEmpty()
  voteId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  @Max(100)
  value: number;
}
