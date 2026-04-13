import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Character, CharacterDocument } from '../schemas/character.schema';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';

@Injectable()
export class CharactersService {
  private readonly MAX_CHARACTERS = 10;

  constructor(
    @InjectModel(Character.name) private characterModel: Model<CharacterDocument>,
  ) {}

  async create(userId: string, createCharacterDto: CreateCharacterDto): Promise<Character> {
    const characterCount = await this.characterModel.countDocuments({ userId }).exec();
    
    if (characterCount >= this.MAX_CHARACTERS) {
      throw new BadRequestException(`캐릭터는 최대 ${this.MAX_CHARACTERS}개까지만 생성할 수 있습니다.`);
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
    
    return newCharacter.save();
  }

  async findAll(userId: string): Promise<Character[]> {
    return this.characterModel.find({ userId }).exec();
  }

  async findOne(userId: string, characterId: string): Promise<Character> {
    const character = await this.characterModel.findOne({ _id: characterId, userId }).exec();
    if (!character) {
      throw new NotFoundException(`캐릭터를 찾을 수 없거나 접근 권한이 없습니다.`);
    }
    return character;
  }

  async update(userId: string, characterId: string, updateCharacterDto: UpdateCharacterDto): Promise<Character> {
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
    return updatedCharacter;
  }

  async remove(userId: string, characterId: string): Promise<{ message: string }> {
    // findOne을 호출하여 존재 여부 및 소유권을 확인
    await this.findOne(userId, characterId);
    
    await this.characterModel.deleteOne({ _id: characterId, userId }).exec();
    return { message: '캐릭터가 성공적으로 삭제되었습니다.' };
  }

  async removeByUserId(userId: string): Promise<void> {
    await this.characterModel.deleteMany({ userId }).exec();
  }
}
