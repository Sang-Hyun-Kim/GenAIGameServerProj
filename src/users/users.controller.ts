import { Controller, Get, Post, Body, Patch, Param, Delete, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('api')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * [Auth] 회원 가입
   */
  @Post('auth/register')
  async register(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return { message: 'Registration successful', user };
  }

  /**
   * [Auth] 로그인 (JWT 토큰 발급)
   */
  @Post('auth/login')
  async login(@Body() loginUserDto: LoginUserDto) {
    const result = await this.usersService.login(loginUserDto);
    return { message: 'Login successful', ...result };
  }

  /**
   * [Users] 내 프로필 조회
   * JWT가 유효한지 검증하고 유저 정보를 반환합니다.
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('users/me')
  getProfile(@Request() req: any) {
    // AuthGuard가 성공하면 req.user에 jwt.strategy.ts의 반환값이 주입됩니다.
    return { message: 'Current user info retrieved', user: req.user };
  }

  /**
   * [Users] 전체 사용자 조회
   */
  @UseGuards(AuthGuard('jwt'))
  @Get('users')
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * [Users] 특정 사용자 정보 수정
   */
  @UseGuards(AuthGuard('jwt'))
  @Patch('users/:id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  /**
   * [Users] 특정 사용자 삭제
   */
  @UseGuards(AuthGuard('jwt'))
  @Delete('users/:id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
