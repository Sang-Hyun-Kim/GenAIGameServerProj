import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserItemsService } from './user-items.service';
import { UserItemsController } from './user-items.controller';
import { UserItem, UserItemSchema } from '../schemas/user-item.schema';
import { CharactersModule } from '../characters/characters.module';
import { ItemsModule } from '../items/items.module';
import { Item, ItemSchema } from '../schemas/item.schema'; // Model inject를 위해 스키마 임포트

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserItem.name, schema: UserItemSchema },
      { name: Item.name, schema: ItemSchema }, // Service에서 Item 모델을 사용하므로 등록
    ]),
    CharactersModule, // CharacterOwnerGuard 및 Character 모델 사용
    ItemsModule, // Items 모듈 기능이 필요할 경우
  ],
  controllers: [UserItemsController],
  providers: [UserItemsService],
})
export class UserItemsModule {}
