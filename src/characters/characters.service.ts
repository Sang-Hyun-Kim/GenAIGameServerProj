import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Character, CharacterDocument } from '../schemas/character.schema';
import { UserItem, UserItemDocument } from '../schemas/user-item.schema';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { LeaderboardsService } from '../leaderboards/leaderboards.service';

@Injectable()
export class CharactersService {
  private readonly MAX_CHARACTERS = 10;

  constructor(
    @InjectModel(Character.name)
    private characterModel: Model<CharacterDocument>,
    @InjectModel(UserItem.name) private userItemModel: Model<UserItemDocument>,
    private readonly leaderboardsService: LeaderboardsService,
  ) {}

  async create(
    userId: string,
    createCharacterDto: CreateCharacterDto,
  ): Promise<Character> {
    const characterCount = await this.characterModel
      .countDocuments({ userId })
      .exec();

    if (characterCount >= this.MAX_CHARACTERS) {
      throw new BadRequestException(
        `캐릭터는 최대 ${this.MAX_CHARACTERS}개까지만 생성할 수 있습니다.`,
      );
    }

    const newCharacter = new this.characterModel({
      userId,
      level: 1,
      hp: 100,
      mp: 50,
      gold: 50,
      attack_point: createCharacterDto.attack_point ?? 0,
      defence_point: createCharacterDto.defence_point ?? 0,
      ...createCharacterDto,
    });

    const savedCharacter = await newCharacter.save();
    
    // [Redis 실시간 랭킹 트리거] 신규 캐릭터 랭킹 진입
    await this.leaderboardsService.syncAll(savedCharacter);

    return savedCharacter;
  }

  async findAll(userId: string): Promise<Character[]> {
    return this.characterModel.find({ userId }).exec();
  }

  async findOne(userId: string, characterId: string): Promise<Character> {
    const character = await this.characterModel
      .findOne({ _id: characterId, userId })
      .exec();
    if (!character) {
      throw new NotFoundException(
        `캐릭터를 찾을 수 없거나 접근 권한이 없습니다.`,
      );
    }
    return character;
  }

  async update(
    userId: string,
    characterId: string,
    updateCharacterDto: UpdateCharacterDto,
  ): Promise<Character> {
    // findOne을 호출하여 존재 여부 및 소유권을 확인
    await this.findOne(userId, characterId);

    const updatedCharacter = await this.characterModel
      .findOneAndUpdate(
        { _id: characterId, userId },
        { $set: updateCharacterDto },
        { new: true },
      )
      .exec();

    if (!updatedCharacter) {
      throw new NotFoundException(`캐릭터 업데이트 실패.`);
    }

    // [Redis 실시간 랭킹 트리거] 스탯(레벨, 골드 등) 업데이트 시 랭킹 동기화
    // 추후 전투/육성 관련 로직(메서드)이 이 서비스나 별도 서비스에 추가될 때,
    // 그 로직의 마지막에 this.leaderboardsService.syncAll() 만 호출해주면 됩니다.
    await this.leaderboardsService.syncAll(updatedCharacter);

    return updatedCharacter;
  }

  async remove(
    userId: string,
    characterId: string,
  ): Promise<{ message: string }> {
    // findOne을 호출하여 존재 여부 및 소유권을 확인
    await this.findOne(userId, characterId);

    // 연쇄 삭제: 캐릭터가 보유한 모든 아이템 삭제
    // 문자열인 characterId를 ObjectId로 명시적 변환하여 Mongoose deleteMany 쿼리 매칭 보장
    await this.userItemModel
      .deleteMany({ characterId: new Types.ObjectId(characterId) })
      .exec();

    // 캐릭터 삭제
    await this.characterModel.deleteOne({ _id: characterId, userId }).exec();

    return { message: '캐릭터 및 보유 아이템이 성공적으로 삭제되었습니다.' };
  }

  async removeByUserId(userId: string): Promise<void> {
    // 삭제할 유저의 캐릭터 목록 조회
    const characters = await this.characterModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();

    if (characters.length > 0) {
      const characterIds = characters.map((c) => c._id);

      // 연쇄 삭제: 모든 캐릭터들이 보유한 아이템 일괄 삭제
      await this.userItemModel
        .deleteMany({ characterId: { $in: characterIds } })
        .exec();

      // 모든 캐릭터 삭제 (명시적 형변환)
      await this.characterModel
        .deleteMany({ userId: new Types.ObjectId(userId) })
        .exec();
    }
  }
}
