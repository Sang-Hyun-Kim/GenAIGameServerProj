import { LeaderboardType } from '../enums/leaderboard-type.enum';

export interface RankingEntryPacket {
  rank: number;                    // 1등, 2등...
  score: number;                   // 점수 (골드량, 레벨 등)
  characterId: string;
  characterName: string;
}

export interface GetLeaderboardResponsePacket {
  success: boolean;
  data: {
    type: LeaderboardType;
    page: number;                  // 현재 페이지 (청크 단위)
    limit: number;                 // 페이지 당 항목 수
    totalRankers: number;          // 랭킹에 등록된 총 유저 수

    // 요청한 유저(나)의 현재 랭킹 정보 (로그인한 경우 선택적 포함)
    myRankInfo?: {
      rank: number;
      score: number;
    };

    // 현재 페이지의 랭킹 리스트 (내림차순)
    entries: RankingEntryPacket[];
  };
  debugMessage?: string;           // 개발 및 디버깅용
}
