import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoticesService } from './notices.service';
import { NoticesController } from './notices.controller';
import { Notice, NoticeSchema } from '../schemas/notice.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notice.name, schema: NoticeSchema }]),
  ],
  controllers: [NoticesController],
  providers: [NoticesService],
})
export class NoticesModule {}
