import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Notice, NoticeDocument } from '../schemas/notice.schema';
import { CreateNoticeDto } from './dto/create-notice.dto';
import { UpdateNoticeDto } from './dto/update-notice.dto';

@Injectable()
export class NoticesService {
  constructor(
    @InjectModel(Notice.name) private noticeModel: Model<NoticeDocument>,
  ) {}

  async create(createNoticeDto: CreateNoticeDto): Promise<Notice> {
    const newNotice = new this.noticeModel(createNoticeDto);
    return newNotice.save();
  }

  async findAll(page: number = 1, limit: number = 10) {
    const total = await this.noticeModel.countDocuments().exec();
    const totalPages = Math.ceil(total / limit);

    // 데이터가 존재하는데 요청한 페이지가 전체 페이지 수를 초과하는 경우 예외 처리
    if (total > 0 && page > totalPages) {
      throw new NotFoundException(
        `요청하신 페이지(page=${page})는 존재하지 않습니다. (전체 페이지: ${totalPages})`,
      );
    }

    const skip = (page - 1) * limit;

    // 최신순으로 정렬(createdAt: -1) 및 페이징 적용
    const items = await this.noticeModel
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return {
      data: items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: string): Promise<Notice> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('유효하지 않은 공지사항 ID입니다.');
    }

    // 상세 조회 시 조회수(views)를 1 증가시킵니다. (확장 제안)
    const notice = await this.noticeModel
      .findByIdAndUpdate(id, { $inc: { views: 1 } }, { new: true })
      .exec();

    if (!notice) {
      throw new NotFoundException(
        `해당 공지사항을 찾을 수 없습니다. (ID: ${id})`,
      );
    }
    return notice;
  }

  async update(id: string, updateNoticeDto: UpdateNoticeDto): Promise<Notice> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('유효하지 않은 공지사항 ID입니다.');
    }

    const updatedNotice = await this.noticeModel
      .findByIdAndUpdate(id, updateNoticeDto, { new: true })
      .exec();

    if (!updatedNotice) {
      throw new NotFoundException(
        `해당 공지사항을 찾을 수 없습니다. (ID: ${id})`,
      );
    }
    return updatedNotice;
  }

  async remove(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('유효하지 않은 공지사항 ID입니다.');
    }

    const result = await this.noticeModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(
        `해당 공지사항을 찾을 수 없습니다. (ID: ${id})`,
      );
    }
    return { message: '공지사항이 성공적으로 삭제되었습니다.' };
  }
}
