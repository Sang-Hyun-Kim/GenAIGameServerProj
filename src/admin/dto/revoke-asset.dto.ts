import { IsNumber, IsOptional, IsString } from 'class-validator';

export class RevokeAssetDto {
  @IsNumber()
  @IsOptional()
  gold?: number;

  @IsString()
  @IsOptional()
  userItemId?: string;

  @IsNumber()
  @IsOptional()
  quantity?: number;
}
