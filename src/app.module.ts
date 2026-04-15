// User 모듈 설정 파일
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { ItemsModule } from './items/items.module';
import { UserItemsModule } from './user-items/user-items.module';
import { NoticesModule } from './notices/notices.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/genai-game',
    ),
    AuthModule,
    UsersModule,
    CharactersModule,
    ItemsModule,
    UserItemsModule,
    NoticesModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
