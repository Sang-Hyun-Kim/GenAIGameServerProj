import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CharactersService } from './characters.service';
import { CharactersController } from './characters.controller';
import { Character, CharacterSchema } from '../schemas/character.schema';
import { UserItem, UserItemSchema } from '../schemas/user-item.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Character.name, schema: CharacterSchema },
      { name: UserItem.name, schema: UserItemSchema },
    ]),
    AuthModule,
  ],
  controllers: [CharactersController],
  providers: [CharactersService],
  exports: [CharactersService, MongooseModule],
})
export class CharactersModule {}
