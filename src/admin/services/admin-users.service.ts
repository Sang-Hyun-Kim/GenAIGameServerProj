import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../../schemas/users.schema';
import { Character, CharacterDocument } from '../../schemas/character.schema';
import { SearchUsersDto } from '../dto/search-users.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UpdateCharacterStatDto } from '../dto/update-character-stat.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Character.name) private characterModel: Model<CharacterDocument>,
  ) {}

  async searchUsers(query: SearchUsersDto) {
    const { page = 1, limit = 10, email, status } = query;
    const filter: any = {};

    if (email) {
      filter.email = { $regex: email, $options: 'i' };
    }
    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    
    const [data, total] = await Promise.all([
      this.userModel.find(filter).skip(skip).limit(Number(limit)).exec(),
      this.userModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserStatus(userId: string, updateDto: UpdateUserStatusDto) {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { status: updateDto.status },
      { new: true }
    ).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // You could also log the 'reason' somewhere if an AuditLog schema exists
    return user;
  }

  async updateCharacterStat(characterId: string, updateDto: UpdateCharacterStatDto) {
    if (!Types.ObjectId.isValid(characterId)) {
      throw new BadRequestException('Invalid character ID');
    }

    const character = await this.characterModel.findByIdAndUpdate(
      characterId,
      { $set: updateDto },
      { new: true }
    ).exec();

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    return character;
  }
}
