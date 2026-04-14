import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // JwtStrategy에 의해 주입된 정보

    if (!user) {
      throw new UnauthorizedException('인증 정보가 없습니다. (로그인 필요)');
    }

    if (user.isAdmin !== true) {
      throw new ForbiddenException('이 작업을 수행할 관리자 권한이 없습니다.');
    }

    return true;
  }
}
