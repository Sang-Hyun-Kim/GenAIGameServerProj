import { IsNumber, Min } from 'class-validator';

export class BuyItemDto {
  @IsNumber()
  itemId!: number;

  @IsNumber()
  @Min(1)
  quantity!: number;
}
