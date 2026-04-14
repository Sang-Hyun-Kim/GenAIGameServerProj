import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserItemsService } from './user-items.service';
import { BuyItemDto } from './dto/buy-item.dto';
import { SellItemDto } from './dto/sell-item.dto';
import { UseItemDto } from './dto/use-item.dto';
import { CharacterOwnerGuard } from '../characters/guards/character-owner.guard';

@UseGuards(AuthGuard('jwt'), CharacterOwnerGuard)
@Controller('api/users/:userId/characters/:characterId/items')
export class UserItemsController {
  constructor(private readonly userItemsService: UserItemsService) {}

  @Get()
  getInventory(@Param('characterId') characterId: string) {
    return this.userItemsService.getInventory(characterId);
  }

  @Get(':userItemId')
  getInventoryItem(@Param('characterId') characterId: string, @Param('userItemId') userItemId: string) {
    return this.userItemsService.getInventoryItem(characterId, userItemId);
  }

  @Post('buy')
  buyItem(@Param('characterId') characterId: string, @Body() buyItemDto: BuyItemDto) {
    return this.userItemsService.buyItem(characterId, buyItemDto);
  }

  @Post('sell')
  sellItem(@Param('characterId') characterId: string, @Body() sellItemDto: SellItemDto) {
    return this.userItemsService.sellItem(characterId, sellItemDto);
  }

  @Post('use')
  useItem(@Param('characterId') characterId: string, @Body() useItemDto: UseItemDto) {
    return this.userItemsService.useItem(characterId, useItemDto);
  }
}
