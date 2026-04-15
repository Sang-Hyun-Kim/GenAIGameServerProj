import { IsNumber, IsOptional } from 'class-validator';

export class BatchUpdateItemDto {
  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  attack?: number;

  @IsNumber()
  @IsOptional()
  defence?: number;

  @IsNumber()
  @IsOptional()
  mp_spend?: number;

  @IsNumber()
  @IsOptional()
  hp_recovery?: number;

  @IsNumber()
  @IsOptional()
  mp_recovery?: number;

  @IsNumber()
  @IsOptional()
  temp_attack?: number;

  @IsNumber()
  @IsOptional()
  temp_defence?: number;
}
