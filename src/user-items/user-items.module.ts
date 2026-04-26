import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserItemsService } from './user-items.service';
import { UserItemsController } from './user-items.controller';
import { UserItem, UserItemSchema } from '../schemas/user-item.schema';
import { CharactersModule } from '../characters/characters.module';
import { ItemsModule } from '../items/items.module';
import { Item, ItemSchema } from '../schemas/item.schema';
import { LeaderboardsModule } from '../leaderboards/leaderboards.module'; // 실시간 랭킹 연동

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserItem.name, schema: UserItemSchema },
      { name: Item.name, schema: ItemSchema },
    ]),
    CharactersModule,
    ItemsModule,
    LeaderboardsModule, // 랭킹 업데이트 트리거용 주입
  ],
  controllers: [UserItemsController],
  providers: [UserItemsService],
})
export class UserItemsModule {}
