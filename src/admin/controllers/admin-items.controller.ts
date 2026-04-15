import { Controller, Patch, Post, Param, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminAuthGuard } from '../../notices/guards/admin-auth.guard';
import { AdminItemsService } from '../services/admin-items.service';
import { GrantRewardDto } from '../dto/grant-reward.dto';
import { RevokeAssetDto } from '../dto/revoke-asset.dto';
import { BatchUpdateItemDto } from '../dto/batch-update-item.dto';

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'), AdminAuthGuard)
export class AdminItemsController {
  constructor(private readonly adminItemsService: AdminItemsService) {}

  @Post('characters/:characterId/rewards')
  async grantReward(
    @Param('characterId') characterId: string,
    @Body() dto: GrantRewardDto,
  ) {
    return this.adminItemsService.grantReward(characterId, dto);
  }

  @Post('characters/:characterId/revoke')
  async revokeAsset(
    @Param('characterId') characterId: string,
    @Body() dto: RevokeAssetDto,
  ) {
    return this.adminItemsService.revokeAsset(characterId, dto);
  }

  @Patch('items/:itemId/balance')
  async batchUpdateItem(
    @Param('itemId') itemId: number,
    @Body() dto: BatchUpdateItemDto,
  ) {
    return this.adminItemsService.batchUpdateItem(itemId, dto);
  }
}
