import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserItem, UserItemDocument } from '../schemas/user-item.schema';
import { Character, CharacterDocument } from '../schemas/character.schema';
import { Item, ItemDocument } from '../schemas/item.schema';
import { BuyItemDto } from './dto/buy-item.dto';
import { SellItemDto } from './dto/sell-item.dto';
import { UseItemDto } from './dto/use-item.dto';

@Injectable()
export class UserItemsService {
  constructor(
    @InjectModel(UserItem.name) private userItemModel: Model<UserItemDocument>,
    @InjectModel(Character.name)
    private characterModel: Model<CharacterDocument>,
    @InjectModel(Item.name) private itemModel: Model<ItemDocument>,
  ) {}

  async getInventory(characterId: string): Promise<UserItem[]> {
    if (!Types.ObjectId.isValid(characterId))
      throw new BadRequestException('유효하지 않은 캐릭터 ID입니다.');
    return this.userItemModel
      .find({ characterId: new Types.ObjectId(characterId) })
      .exec();
  }

  async getInventoryItem(
    characterId: string,
    userItemId: string,
  ): Promise<UserItem> {
    if (!Types.ObjectId.isValid(characterId))
      throw new BadRequestException('유효하지 않은 캐릭터 ID입니다.');
    if (!Types.ObjectId.isValid(userItemId))
      throw new BadRequestException('유효하지 않은 아이템 ID입니다.');
    const item = await this.userItemModel
      .findOne({
        _id: new Types.ObjectId(userItemId),
        characterId: new Types.ObjectId(characterId),
      })
      .exec();

    if (!item) {
      throw new NotFoundException('아이템을 찾을 수 없습니다.');
    }
    return item;
  }

  async buyItem(characterId: string, buyItemDto: BuyItemDto) {
    const { itemId, quantity } = buyItemDto;

    const character = await this.characterModel.findById(characterId);
    if (!character) throw new NotFoundException('캐릭터를 찾을 수 없습니다.');

    const itemMaster = await this.itemModel.findOne({ itemId });
    if (!itemMaster)
      throw new NotFoundException('존재하지 않는 시스템 아이템입니다.');

    const totalPrice = itemMaster.price * quantity;
    if (character.gold < totalPrice) {
      throw new BadRequestException('골드가 부족합니다.');
    }

    // 골드 차감
    character.gold -= totalPrice;
    await character.save();

    // 장비(type: 0, 1)는 보통 중첩되지 않고, 소모품(type: 2)은 중첩된다고 가정합니다.
    if (itemMaster.type === 2) {
      const existingItem = await this.userItemModel.findOne({
        characterId: new Types.ObjectId(characterId),
        itemId,
      });

      if (existingItem) {
        existingItem.quantity += quantity;
        await existingItem.save();
        return {
          message: '아이템 구매 완료 (수량 증가)',
          character,
          item: existingItem,
        };
      }
    }

    // 장비이거나, 첫 소모품 구매인 경우
    const promises: Promise<UserItemDocument>[] = [];
    for (let i = 0; i < (itemMaster.type === 2 ? 1 : quantity); i++) {
      const newItem = new this.userItemModel({
        characterId: new Types.ObjectId(characterId),
        itemId,
        quantity: itemMaster.type === 2 ? quantity : 1,
      });
      promises.push(newItem.save());
    }

    const savedItems = await Promise.all(promises);

    return { message: '아이템 구매 완료', character, items: savedItems };
  }

  async sellItem(characterId: string, sellItemDto: SellItemDto) {
    const { userItemId, quantity } = sellItemDto;

    const userItem = await this.userItemModel.findOne({
      _id: new Types.ObjectId(userItemId),
      characterId: new Types.ObjectId(characterId),
    });

    if (!userItem)
      throw new NotFoundException('보유한 아이템을 찾을 수 없습니다.');
    if (userItem.quantity < quantity)
      throw new BadRequestException('보유 수량보다 많이 팔 수 없습니다.');
    if (userItem.isEquipped)
      throw new BadRequestException(
        '장착 중인 아이템은 팔 수 없습니다. 장착 해제 후 판매하세요.',
      );

    const itemMaster = await this.itemModel.findOne({
      itemId: userItem.itemId,
    });
    if (!itemMaster)
      throw new NotFoundException('시스템 아이템 정보가 누락되었습니다.');

    const character = await this.characterModel.findById(characterId);
    if (!character) throw new NotFoundException('캐릭터를 찾을 수 없습니다.');

    // 판매 가격 (예: 구매가의 50%)
    const sellPrice = Math.floor(itemMaster.price * 0.5) * quantity;

    // 골드 증가
    character.gold += sellPrice;
    await character.save();

    // 아이템 수량 감소 또는 삭제
    if (userItem.quantity === quantity) {
      await this.userItemModel.deleteOne({ _id: userItem._id });
    } else {
      userItem.quantity -= quantity;
      await userItem.save();
    }

    return {
      message: '아이템 판매 완료',
      sellPrice,
      currentGold: character.gold,
    };
  }

  async useItem(characterId: string, useItemDto: UseItemDto) {
    const { userItemId } = useItemDto;

    const userItem = await this.userItemModel.findOne({
      _id: new Types.ObjectId(userItemId),
      characterId: new Types.ObjectId(characterId),
    });

    if (!userItem)
      throw new NotFoundException('보유한 아이템을 찾을 수 없습니다.');

    const itemMaster = await this.itemModel.findOne({
      itemId: userItem.itemId,
    });
    if (!itemMaster)
      throw new NotFoundException('시스템 아이템 정보가 누락되었습니다.');

    const character = await this.characterModel.findById(characterId);
    if (!character) throw new NotFoundException('캐릭터를 찾을 수 없습니다.');

    // 소모품인 경우 (type: 2: 회복)
    if (itemMaster.type === 2) {
      if (character.mp < itemMaster.mp_spend) {
        throw new BadRequestException(
          '마나가 부족하여 아이템을 사용할 수 없습니다.',
        );
      }
      character.hp += itemMaster.hp_recovery;
      character.mp += itemMaster.mp_recovery;
      character.mp -= itemMaster.mp_spend;
      // 추가 스탯 로직 반영 가능: temp_attack, temp_defence

      await character.save();

      if (userItem.quantity > 1) {
        userItem.quantity -= 1;
        await userItem.save();
      } else {
        await this.userItemModel.deleteOne({ _id: userItem._id });
      }
      return { message: '아이템 사용(소모) 완료', character };
    }
    // 장비인 경우 (type: 0 공격, type: 1 방어) 장착/해제 토글
    else {
      userItem.isEquipped = !userItem.isEquipped;
      await userItem.save();

      // 스탯 반영 및 캐릭터 장비 슬롯 업데이트
      if (userItem.isEquipped) {
        // 장착 시 캐릭터 스탯 증가
        character.attack_point += itemMaster.attack;
        character.defence_point += itemMaster.defence;

        // 슬롯 업데이트: 공격(type:0)
        if (itemMaster.type === 0) character.attack_item_id = itemMaster.itemId;
        // else 방어(type:1) 방어구 슬롯 처리 (간략화)
        else if (itemMaster.type === 1)
          character.defence_item1_id = itemMaster.itemId;
      } else {
        // 해제 시 캐릭터 스탯 감소
        character.attack_point -= itemMaster.attack;
        character.defence_point -= itemMaster.defence;

        if (itemMaster.type === 0) character.attack_item_id = null;
        else if (itemMaster.type === 1) character.defence_item1_id = null;
      }

      await character.save();
      return {
        message: `아이템 장착 ${userItem.isEquipped ? '성공' : '해제'}`,
        character,
        userItem,
      };
    }
  }
}
