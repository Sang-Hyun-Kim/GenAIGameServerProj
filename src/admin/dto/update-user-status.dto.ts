import { IsIn, IsString, IsOptional } from 'class-validator';

export class UpdateUserStatusDto {
  @IsString()
  @IsIn(['ACTIVE', 'BANNED'])
  status!: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
