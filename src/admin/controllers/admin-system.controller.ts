import { Controller, Post, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminAuthGuard } from '../../notices/guards/admin-auth.guard';
import { AdminSystemService } from '../services/admin-system.service';

@Controller('api/admin/system')
@UseGuards(AuthGuard('jwt'), AdminAuthGuard)
export class AdminSystemController {
  constructor(private readonly adminSystemService: AdminSystemService) {}

  @Post('cache-warm/:target')
  async warmCache(@Param('target') target: string) {
    // target 파라미터를 통해 특정 도메인(예: leaderboards)만 선택적으로 새로고침 가능
    return this.adminSystemService.warmCache(target);
  }
}
