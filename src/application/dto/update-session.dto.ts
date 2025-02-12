import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateSessionDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(50)
  name?: string;

  @IsUUID()
  @IsOptional()
  currentTaskId?: string;

  @IsBoolean()
  @IsOptional()
  isVotingActive?: boolean;
}
