import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../schemas/users.schema';
import { AuthModule } from '../auth/auth.module';
import { CharactersModule } from '../characters/characters.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule), // JwtService 사용을 위해 AuthModule 임포트
    forwardRef(() => CharactersModule), // 캐릭터 연쇄 삭제를 위해 CharactersModule 임포트
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Auth 모듈에서 User 정보 조회 시 사용
})
export class UsersModule {}
