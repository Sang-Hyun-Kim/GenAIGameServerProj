import { IsMongoId, IsNumber, Min } from 'class-validator';

export class SellItemDto {
  @IsMongoId()
  userItemId!: string; // 보유 중인 아이템의 고유 ID (_id)

  @IsNumber()
  @Min(1)
  quantity!: number;
}
