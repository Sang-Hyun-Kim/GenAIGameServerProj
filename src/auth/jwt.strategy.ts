import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secretKey',
    });
  }

  async validate(payload: any) {
    // JWT 토큰이 유효한 경우, payload(토큰에 담긴 데이터)가 전달됩니다.
    // 여기서 추가로 유저가 여전히 존재하는지 검증할 수 있습니다.
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found or token invalid');
    }
    // req.user에 세팅됩니다.
    return { userId: payload.sub, email: payload.email };
  }
}
