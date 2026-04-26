import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { Character, CharacterSchema } from '../schemas/character.schema';
import { UserItem, UserItemSchema } from '../schemas/user-item.schema';
import { AuthModule } from '../auth/auth.module';
import { LeaderboardsModule } from '../leaderboards/leaderboards.module'; // 랭킹 연동

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Character.name, schema: CharacterSchema },
      { name: UserItem.name, schema: UserItemSchema },
    ]),
    AuthModule,
    LeaderboardsModule, // 랭킹 업데이트 트리거용 주입
  ],
  controllers: [CharactersController],
  providers: [CharactersService],
  exports: [CharactersService, MongooseModule],
})
export class CharactersModule {}
