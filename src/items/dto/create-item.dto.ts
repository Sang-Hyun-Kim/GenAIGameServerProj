import { IsNumber, IsString, IsEnum, IsOptional, Min } from 'class-validator';

export class CreateItemDto {
  @IsNumber()
  itemId!: number;

  @IsString()
  name!: string;

  @IsEnum([0, 1, 2], { message: 'Type must be 0(Weapon), 1(Armor), or 2(Consumable)' })
  type!: number;

  @IsNumber()
  @Min(0)
  price!: number;

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

  @IsString()
  @IsOptional()
  description?: string;
}
