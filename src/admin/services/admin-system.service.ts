import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Character, CharacterDocument } from '../../schemas/character.schema';
import { LeaderboardsService } from '../../leaderboards/leaderboards.service';

@Injectable()
export class AdminSystemService {
  private readonly logger = new Logger('AdminSystemService');

  constructor(
    @InjectModel(Character.name) private characterModel: Model<CharacterDocument>,
    private readonly leaderboardsService: LeaderboardsService,
  ) {}

  async warmCache(target: string) {
    this.logger.log(`Starting cache warming for target: ${target}`);
    const startTime = Date.now();

    if (target === 'leaderboards' || target === 'all') {
      await this.warmLeaderboards();
    } else {
      throw new BadRequestException(`Unknown cache warm target: ${target}`);
    }

    const elapsed = Date.now() - startTime;
    this.logger.log(`Cache warming completed in ${elapsed}ms`);

    return {
      message: 'Cache warming completed successfully',
      target,
      elapsedTimeMs: elapsed,
    };
  }

  private async warmLeaderboards() {
    // .lean()을 사용하여 Mongoose Document 오버헤드를 제거하고 순수 JS 객체로 가져옴 (성능 극대화)
    const cursor = this.characterModel.find().lean().cursor();
    let count = 0;
    let batch: any[] = [];
    const BATCH_SIZE = 1000;

    // cursor를 사용하여 메모리 오버헤드(OOM) 방지
    for await (const character of cursor) {
      batch.push(character);

      if (batch.length >= BATCH_SIZE) {
        await this.processLeaderboardBatch(batch);
        count += batch.length;
        this.logger.log(`Warmed ${count} characters into Redis...`);
        batch = []; // 배치 초기화
      }
    }

    // 남은 자투리 데이터 처리
    if (batch.length > 0) {
      await this.processLeaderboardBatch(batch);
      count += batch.length;
      this.logger.log(`Warmed final batch. Total: ${count} characters.`);
    }
  }

  private async processLeaderboardBatch(characters: any[]) {
    // 1000개의 캐릭터에 대해 3개의 랭킹(골드, 레벨, 전투력)을 동시에 비동기 업데이트
    // Promise.all을 사용하여 Redis I/O 대기 시간을 최소화
    const promises = characters.map(char => this.leaderboardsService.syncAll(char));
    await Promise.all(promises);
  }
}
