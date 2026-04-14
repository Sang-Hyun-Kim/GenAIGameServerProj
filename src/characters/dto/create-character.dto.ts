import { IsInt, IsNotEmpty, IsIn, IsOptional, Min } from 'class-validator';

export class CreateCharacterDto {
  @IsInt()
  @IsNotEmpty()
  @IsIn([0, 1, 2], {
    message: '종족(race)은 0(용족), 1(엘프), 2(인간족) 중 하나여야 합니다.',
  })
  race!: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  attack_point?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  defence_point?: number;
}
