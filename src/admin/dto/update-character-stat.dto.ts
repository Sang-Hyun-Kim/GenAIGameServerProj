import { IsNumber, IsOptional } from 'class-validator';

export class UpdateCharacterStatDto {
  @IsNumber()
  @IsOptional()
  level?: number;

  @IsNumber()
  @IsOptional()
  exp?: number;

  @IsNumber()
  @IsOptional()
  hp?: number;

  @IsNumber()
  @IsOptional()
  mp?: number;

  @IsNumber()
  @IsOptional()
  attack_point?: number;

  @IsNumber()
  @IsOptional()
  defence_point?: number;
}
