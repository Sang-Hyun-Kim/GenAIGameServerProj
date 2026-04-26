import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Item, ItemDocument } from '../../schemas/item.schema';
import { UserItem, UserItemDocument } from '../../schemas/user-item.schema';
import { Character, CharacterDocument } from '../../schemas/character.schema';
import { GrantRewardDto } from '../dto/grant-reward.dto';
import { RevokeAssetDto } from '../dto/revoke-asset.dto';
import { BatchUpdateItemDto } from '../dto/batch-update-item.dto';
import { LeaderboardsService } from '../../leaderboards/leaderboards.service';

@Injectable()
export class AdminItemsService {
  constructor(
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
    @InjectModel(UserItem.name) private userItemModel: Model<UserItemDocument>,
    @InjectModel(Character.name) private characterModel: Model<CharacterDocument>,
    private readonly leaderboardsService: LeaderboardsService,
  ) {}

  async grantReward(characterId: string, dto: GrantRewardDto) {
    if (!Types.ObjectId.isValid(characterId)) {
      throw new BadRequestException('Invalid character ID');
    }

    const character = await this.characterModel.findById(characterId);
    if (!character) {
      throw new NotFoundException('Character not found');
    }

    let needsSync = false;

    if (dto.gold) {
      character.gold += dto.gold;
      await character.save();
      needsSync = true;
    }

    if (dto.itemId) {
      const item = await this.itemModel.findOne({ itemId: dto.itemId });
      if (!item) {
        throw new NotFoundException('Master Item not found');
      }

      const qty = dto.quantity || 1;

      if (item.type === 2) {
        // Consumable: stack quantity
        const existing = await this.userItemModel.findOne({
          characterId: character._id,
          itemId: item.itemId,
        });

        if (existing) {
          existing.quantity += qty;
          await existing.save();
        } else {
          await new this.userItemModel({
            characterId: character._id,
            itemId: item.itemId,
            quantity: qty,
            isEquipped: false,
          }).save();
        }
      } else {
        // Equipment: create new slots
        for (let i = 0; i < qty; i++) {
          await new this.userItemModel({
            characterId: character._id,
            itemId: item.itemId,
            quantity: 1,
            isEquipped: false,
          }).save();
        }
      }
    }

    // [Redis 실시간 랭킹 트리거] 골드 변동이 있었다면 랭킹 업데이트
    if (needsSync) {
      await this.leaderboardsService.syncAll(character);
    }

    return { message: 'Reward granted successfully', characterId };
  }

  async revokeAsset(characterId: string, dto: RevokeAssetDto) {
    if (!Types.ObjectId.isValid(characterId)) {
      throw new BadRequestException('Invalid character ID');
    }

    const character = await this.characterModel.findById(characterId);
    if (!character) {
      throw new NotFoundException('Character not found');
    }

    let needsSync = false;

    if (dto.gold) {
      character.gold = Math.max(0, character.gold - dto.gold);
      await character.save();
      needsSync = true;
    }

    if (dto.userItemId) {
      if (!Types.ObjectId.isValid(dto.userItemId)) {
        throw new BadRequestException('Invalid UserItem ID');
      }

      const userItem = await this.userItemModel.findOne({
        _id: new Types.ObjectId(dto.userItemId),
        characterId: character._id,
      });

      if (!userItem) {
        throw new NotFoundException('UserItem not found in this character');
      }

      const masterItem = await this.itemModel.findOne({ itemId: userItem.itemId });

      // If equipped, unequip and deduct stats
      if (userItem.isEquipped && masterItem) {
        character.attack_point = Math.max(0, character.attack_point - masterItem.attack);
        character.defence_point = Math.max(0, character.defence_point - masterItem.defence);

        if (character.attack_item_id === userItem.itemId) character.attack_item_id = null;
        if (character.defence_item1_id === userItem.itemId) character.defence_item1_id = null;
        if (character.defence_item2_id === userItem.itemId) character.defence_item2_id = null;
        if (character.defence_item3_id === userItem.itemId) character.defence_item3_id = null;
        if (character.defence_item4_id === userItem.itemId) character.defence_item4_id = null;

        await character.save();
        needsSync = true; // 스탯 변동 발생
      }

      const removeQty = dto.quantity || userItem.quantity;
      userItem.quantity -= removeQty;

      if (userItem.quantity <= 0) {
        await this.userItemModel.findByIdAndDelete(userItem._id);
      } else {
        userItem.isEquipped = false; // Force unequip on revoke
        await userItem.save();
      }
    }

    // [Redis 실시간 랭킹 트리거] 골드나 스탯(장착해제) 변동이 있었다면 랭킹 업데이트
    if (needsSync) {
      await this.leaderboardsService.syncAll(character);
    }

    return { message: 'Asset revoked successfully', characterId };
  }

  async batchUpdateItem(itemId: number, dto: BatchUpdateItemDto) {
    const updatedItem = await this.itemModel.findOneAndUpdate(
      { itemId: Number(itemId) },
      { $set: dto },
      { new: true }
    ).exec();

    if (!updatedItem) {
      throw new NotFoundException(`Master item with ID ${itemId} not found`);
    }

    return updatedItem;
  }
}
