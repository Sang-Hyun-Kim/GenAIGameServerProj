import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { UpdateCharacterDto } from './dto/update-character.dto';
import { CharacterOwnerGuard } from './guards/character-owner.guard';

@Controller('api/users/:userId/characters')
@UseGuards(AuthGuard('jwt'))
export class CharactersController {
  constructor(private readonly charactersService: CharactersService) {}

  // 경로 변수인 userId가 실제 로그인한 유저(토큰)의 ID와 일치하는지 확인하는 헬퍼 메서드
  private validateUserId(req: any, paramUserId: string) {
    const reqUserId = req.user?.userId;
    console.log(
      `[DEBUG] validateUserId -> reqUserId: ${reqUserId}, paramUserId: ${paramUserId}`,
    );
    if (!reqUserId) {
      throw new ForbiddenException(
        '인증 정보가 없습니다. (req.user.userId is undefined)',
      );
    }
    if (reqUserId !== paramUserId) {
      throw new ForbiddenException(
        `본인의 캐릭터 정보만 접근할 수 있습니다. (Token ID: ${reqUserId}, URL ID: ${paramUserId})`,
      );
    }
  }

  @Post()
  create(
    @Request() req,
    @Param('userId') userId: string,
    @Body() createCharacterDto: CreateCharacterDto,
  ) {
    this.validateUserId(req, userId);
    return this.charactersService.create(req.user.userId, createCharacterDto);
  }

  @Get()
  findAll(@Request() req, @Param('userId') userId: string) {
    this.validateUserId(req, userId);
    return this.charactersService.findAll(req.user.userId);
  }

  @Get(':characterId')
  @UseGuards(CharacterOwnerGuard)
  findOne(
    @Request() req,
    @Param('userId') userId: string,
    @Param('characterId') characterId: string,
  ) {
    this.validateUserId(req, userId);
    return this.charactersService.findOne(req.user.userId, characterId);
  }

  @Patch(':characterId')
  @UseGuards(CharacterOwnerGuard)
  update(
    @Request() req,
    @Param('userId') userId: string,
    @Param('characterId') characterId: string,
    @Body() updateCharacterDto: UpdateCharacterDto,
  ) {
    this.validateUserId(req, userId);
    return this.charactersService.update(
      req.user.userId,
      characterId,
      updateCharacterDto,
    );
  }

  @Delete(':characterId')
  @UseGuards(CharacterOwnerGuard)
  remove(
    @Request() req,
    @Param('userId') userId: string,
    @Param('characterId') characterId: string,
  ) {
    this.validateUserId(req, userId);
    return this.charactersService.remove(req.user.userId, characterId);
  }
}
