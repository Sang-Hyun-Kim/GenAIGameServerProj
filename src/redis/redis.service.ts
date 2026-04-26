import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('Redis:Leaderboard');
  private client: Redis;

  onModuleInit() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });

    this.client.on('connect', () => {
      this.logger.log('Successfully connected to Redis Server.');
    });

    this.client.on('error', (error) => {
      this.logger.error(`Redis connection error: ${error.message}`);
    });
  }

  onModuleDestroy() {
    this.client.quit();
  }

  // --- Leaderboard (ZSET) Methods ---

  /**
   * 랭킹 점수를 갱신합니다.
   * @param key Redis ZSET Key (ex: "leaderboard:GOLD")
   * @param score 랭킹 점수 (골드, 레벨 등)
   * @param memberId 유저/캐릭터 식별자 (member string: "characterId:characterName")
   */
  async setScore(key: string, score: number, memberId: string): Promise<void> {
    await this.client.zadd(key, score, memberId);
    this.logger.log(`[Score Updated] Key: ${key} | Member: ${memberId} | New Score: ${score}`);
  }

  /**
   * 특정 유저의 순위를 조회합니다. (1등부터 시작)
   * @param key Redis ZSET Key
   * @param memberId 유저/캐릭터 식별자
   * @returns 랭킹(1-based) 또는 등록되지 않은 경우 null
   */
  async getRank(key: string, memberId: string): Promise<number | null> {
    const rank = await this.client.zrevrank(key, memberId);
    if (rank === null) return null;
    return rank + 1; // zrevrank는 0-based index이므로 1을 더해 실제 순위로 변환
  }

  /**
   * 특정 유저의 점수를 조회합니다.
   * @param key Redis ZSET Key
   * @param memberId 유저/캐릭터 식별자
   */
  async getScore(key: string, memberId: string): Promise<number | null> {
    const score = await this.client.zscore(key, memberId);
    return score ? parseFloat(score) : null;
  }

  /**
   * 랭킹(ZSET)의 지정된 범위의 항목들을 가져옵니다. (내림차순, 점수 포함)
   * @param key Redis ZSET Key
   * @param start 시작 인덱스 (0-based)
   * @param stop 종료 인덱스 (포함)
   * @returns 멤버 식별자와 점수가 짝을 이룬 문자열 배열 (ex: ["memberA", "100", "memberB", "50"])
   */
  async getTopRanks(key: string, start: number, stop: number): Promise<string[]> {
    const startTime = Date.now();
    const result = await this.client.zrevrange(key, start, stop, 'WITHSCORES');
    const elapsed = Date.now() - startTime;
    this.logger.debug(`[getTopRanks] Key: ${key} | Range: ${start}~${stop} | Extracted: ${result.length / 2} items | Time: ${elapsed}ms`);
    return result;
  }

  /**
   * 해당 랭킹(ZSET)에 등록된 전체 멤버 수를 반환합니다.
   * @param key Redis ZSET Key
   */
  async getTotalRankers(key: string): Promise<number> {
    return await this.client.zcard(key);
  }
}
