import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateCharacterDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  gold?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  hp?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  mp?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  exp?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  level?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  attack_point?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  defence_point?: number;

  @IsOptional()
  @IsInt()
  attack_item_id?: number;

  @IsOptional()
  @IsInt()
  defence_item1_id?: number;

  @IsOptional()
  @IsInt()
  defence_item2_id?: number;

  @IsOptional()
  @IsInt()
  defence_item3_id?: number;

  @IsOptional()
  @IsInt()
  defence_item4_id?: number;
}
