import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Character, CharacterDocument } from '../../schemas/character.schema';

@Injectable()
export class CharacterOwnerGuard implements CanActivate {
  constructor(
    @InjectModel(Character.name)
    private characterModel: Model<CharacterDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const characterId = request.params.characterId || request.params.id;

    console.log(
      `[DEBUG] CharacterOwnerGuard -> userId: ${userId}, characterId: ${characterId}`,
    );

    if (!userId) {
      throw new ForbiddenException(
        '인증되지 않은 사용자입니다. (req.user.userId is undefined)',
      );
    }

    if (!characterId) {
      // characterId가 필요한 라우트가 아니라면 통과 (예: POST /api/characters)
      return true;
    }

    if (!Types.ObjectId.isValid(characterId)) {
      throw new BadRequestException('유효하지 않은 캐릭터 ID 형식입니다.');
    }

    const character = await this.characterModel.findById(characterId).exec();

    if (!character) {
      throw new NotFoundException('캐릭터를 찾을 수 없습니다.');
    }

    if (character.userId.toString() !== userId) {
      throw new ForbiddenException('이 캐릭터에 대한 접근 권한이 없습니다.');
    }

    // 다음 핸들러에서 DB 조회를 피하기 위해 request 객체에 캐릭터 정보를 담을 수도 있습니다.
    request.character = character;

    return true;
  }
}
