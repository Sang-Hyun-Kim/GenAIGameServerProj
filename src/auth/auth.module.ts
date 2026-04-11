import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secretKey',
      signOptions: { expiresIn: '1h' },
    }),
    forwardRef(() => UsersModule), // UsersModule과 순환 참조 방지
  ],
  providers: [JwtStrategy],
  exports: [JwtModule, PassportModule], // UsersService에서 JwtService를 쓸 수 있도록 내보냄
})
export class AuthModule {}
