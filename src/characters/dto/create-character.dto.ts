import { IsInt, IsNotEmpty, IsIn, IsOptional, Min, IsString, MaxLength } from 'class-validator';

export class CreateCharacterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20, { message: '캐릭터 이름은 최대 20자까지 가능합니다.' })
  name!: string;

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
