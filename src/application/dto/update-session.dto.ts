import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  currentTaskId?: string;

  @IsBoolean()
  @IsOptional()
  isVotingActive?: boolean;
}
