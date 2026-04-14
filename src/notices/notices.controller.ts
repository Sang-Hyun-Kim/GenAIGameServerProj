import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { NoticesService } from './notices.service';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';
import { AuthGuard } from '@nestjs/passport';
import { AdminAuthGuard } from './guards/admin-auth.guard';

@Controller('api/notices')
export class NoticesController {
  constructor(private readonly noticesService: NoticesService) {}

  @UseGuards(AuthGuard('jwt'), AdminAuthGuard) // 관리자 전용
  @Post()
  create(@Body() createNoticeDto: CreateNoticeDto) {
    return this.noticesService.create(createNoticeDto);
  }

  @UseGuards(AuthGuard('jwt')) // 모든 유저 열람 가능
  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    let pageNum = page ? parseInt(page, 10) : 1;
    let limitNum = limit ? parseInt(limit, 10) : 10;
    
    if (isNaN(pageNum) || pageNum < 1) pageNum = 1;
    if (isNaN(limitNum) || limitNum < 1) limitNum = 10;

    return this.noticesService.findAll(pageNum, limitNum);
  }

  @UseGuards(AuthGuard('jwt')) // 모든 유저 열람 가능
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.noticesService.findOne(id);
  }

  @UseGuards(AuthGuard('jwt'), AdminAuthGuard) // 관리자 전용
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNoticeDto: UpdateNoticeDto) {
    return this.noticesService.update(id, updateNoticeDto);
  }

  @UseGuards(AuthGuard('jwt'), AdminAuthGuard) // 관리자 전용
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.noticesService.remove(id);
  }
}
