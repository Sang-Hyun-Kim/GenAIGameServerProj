import { IsNumber, IsOptional } from 'class-validator';

export class GrantRewardDto {
  @IsNumber()
  @IsOptional()
  gold?: number;

  @IsNumber()
  @IsOptional()
  itemId?: number;

  @IsNumber()
  @IsOptional()
  quantity?: number;
}
