import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminAuthGuard } from '../../notices/guards/admin-auth.guard';
import { AdminUsersService } from '../services/admin-users.service';
import { SearchUsersDto } from '../dto/search-users.dto';
import { UpdateUserStatusDto } from '../dto/update-user-status.dto';
import { UpdateCharacterStatDto } from '../dto/update-character-stat.dto';

@Controller('api/admin')
@UseGuards(AuthGuard('jwt'), AdminAuthGuard)
export class AdminUsersController {
  constructor(private readonly adminUsersService: AdminUsersService) {}

  @Get('users')
  async searchUsers(@Query() query: SearchUsersDto) {
    return this.adminUsersService.searchUsers(query);
  }

  @Patch('users/:userId/status')
  async updateUserStatus(
    @Param('userId') userId: string,
    @Body() updateDto: UpdateUserStatusDto,
  ) {
    return this.adminUsersService.updateUserStatus(userId, updateDto);
  }

  @Patch('characters/:characterId/stats')
  async updateCharacterStat(
    @Param('characterId') characterId: string,
    @Body() updateDto: UpdateCharacterStatDto,
  ) {
    return this.adminUsersService.updateCharacterStat(characterId, updateDto);
  }
}
