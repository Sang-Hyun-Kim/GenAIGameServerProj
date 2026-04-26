import { Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe, ParseEnumPipe } from '@nestjs/common';
import { LeaderboardsService } from './leaderboards.service';
import { LeaderboardType } from '../../packets/enums/leaderboard-type.enum';
import { GetLeaderboardResponsePacket } from '../../packets/responses/get-leaderboard.packet';

@Controller('api/leaderboards')
export class LeaderboardsController {
  constructor(private readonly leaderboardsService: LeaderboardsService) {}

  @Get(':type')
  async getLeaderboard(
    @Param('type', new ParseEnumPipe(LeaderboardType)) type: LeaderboardType,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    // TODO: 로그인된 유저의 토큰에서 userId/characterId를 받아 내 랭킹을 포함하려면 JwtAuthGuard가 필요.
    // 현재는 로그인 없이 모두 조회 가능하도록 구성 (포트폴리오용).
  ): Promise<GetLeaderboardResponsePacket> {
    // 0보다 작은 page, limit 요청 방어
    if (page < 1) page = 1;
    if (limit < 1 || limit > 100) limit = 50;

    return this.leaderboardsService.getLeaderboard(type, page, limit);
  }
}
