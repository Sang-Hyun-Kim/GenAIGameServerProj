import { IsMongoId } from 'class-validator';

export class UseItemDto {
  @IsMongoId()
  userItemId!: string; // 사용할 아이템의 고유 ID (_id)
}
