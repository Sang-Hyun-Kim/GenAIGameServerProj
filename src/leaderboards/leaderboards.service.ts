import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { LeaderboardType } from '../../packets/enums/leaderboard-type.enum';
import { GetLeaderboardResponsePacket, RankingEntryPacket } from '../../packets/responses/get-leaderboard.packet';
import { Character } from '../schemas/character.schema';

@Injectable()
export class LeaderboardsService {
  private readonly logger = new Logger('LeaderboardsService');

  constructor(private readonly redisService: RedisService) {}

  getRedisKey(type: LeaderboardType): string {
    return `leaderboard:${type.toLowerCase()}`;
  }

  private getMemberString(character: any): string {
    const charId = character._id ? character._id.toString() : character.id;
    // 캐릭터 이름이 없는 레거시 데이터 방어 처리
    const charName = character.name || `Hero(Race${character.race})`;
    return `${charId}:${charName}`;
  }

  /**
   * 전체 랭킹을 한 번에 동기화합니다. (캐릭터 최초 생성, 어드민 스탯 일괄 수정 시 사용)
   */
  async syncAll(character: any): Promise<void> {
    try {
      await Promise.all([
        this.syncGold(character),
        this.syncLevel(character),
        this.syncCombatPower(character),
      ]);
    } catch (error: any) {
      this.logger.error(`[syncAll] Failed to sync all stats: ${error.message}`);
    }
  }

  /**
   * 골드 랭킹만 동기화합니다. (아이템 매매, 골드 획득/소모 시 호출)
   */
  async syncGold(character: any): Promise<void> {
    try {
      const memberString = this.getMemberString(character);
      await this.redisService.setScore(
        this.getRedisKey(LeaderboardType.GOLD),
        character.gold || 0,
        memberString,
      );
    } catch (error: any) {
      this.logger.error(`[syncGold] Failed: ${error.message}`);
    }
  }

  /**
   * 레벨 랭킹만 동기화합니다. (경험치 획득, 레벨업 시 호출)
   */
  async syncLevel(character: any): Promise<void> {
    try {
      const memberString = this.getMemberString(character);
      await this.redisService.setScore(
        this.getRedisKey(LeaderboardType.LEVEL),
        character.level || 0,
        memberString,
      );
    } catch (error: any) {
      this.logger.error(`[syncLevel] Failed: ${error.message}`);
    }
  }

  /**
   * 전투력 랭킹만 동기화합니다. (아이템 장착/해제, 영구 스탯 증가 시 호출)
   */
  async syncCombatPower(character: any): Promise<void> {
    try {
      const memberString = this.getMemberString(character);
      const combatPower = (character.attack_point || 0) + (character.defence_point || 0);
      await this.redisService.setScore(
        this.getRedisKey(LeaderboardType.COMBAT_POWER),
        combatPower,
        memberString,
      );
    } catch (error: any) {
      this.logger.error(`[syncCombatPower] Failed: ${error.message}`);
    }
  }

  async getLeaderboard(
    type: LeaderboardType,
    page: number,
    limit: number,
    myCharacterId?: string,
  ): Promise<GetLeaderboardResponsePacket> {
    const key = this.getRedisKey(type);
    const start = (page - 1) * limit;
    const stop = start + limit - 1;

    // 전체 등록 수
    const totalRankers = await this.redisService.getTotalRankers(key);

    // 해당 페이지의 멤버와 스코어
    const rawRanks = await this.redisService.getTopRanks(key, start, stop);
    
    // rawRanks는 ["memberId1", "score1", "memberId2", "score2"] 형태
    const entries: RankingEntryPacket[] = [];
    for (let i = 0; i < rawRanks.length; i += 2) {
      const memberString = rawRanks[i];
      const score = parseFloat(rawRanks[i + 1]);
      const rank = start + (i / 2) + 1; // 1등부터 시작

      // memberString은 "characterId:characterName" 형식으로 저장된다고 가정
      const [characterId, ...nameParts] = memberString.split(':');
      const characterName = nameParts.join(':');

      entries.push({
        rank,
        score,
        characterId,
        characterName,
      });
    }

    // (선택) 내 랭킹 정보 조회
    let myRankInfo = undefined;
    if (myCharacterId) {
      // member string을 찾기 위해 전체 유저 이름이 필요하거나 Redis Key 설계를 조금 바꿔야 할 수 있지만,
      // 일단 memberString을 "characterId:characterName"으로 저장한다고 가정했기 때문에 myCharacterId만으로 
      // zrevrank를 하기엔 정확한 member값을 모를 수 있음. 
      // (TODO: Phase 3에서 member값 설정 시, 혹은 별도의 매핑 Hash 테이블 사용을 고려)
    }

    return {
      success: true,
      data: {
        type,
        page,
        limit,
        totalRankers,
        entries,
        myRankInfo,
      },
    };
  }
}

