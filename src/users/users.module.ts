import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from '../schemas/users.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule), // JwtService 사용을 위해 AuthModule 임포트 (순환 참조 방지)
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Auth 모듈에서 User 정보 조회 시 사용
})
export class UsersModule {}
