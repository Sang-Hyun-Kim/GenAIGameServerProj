import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NoticeDocument = HydratedDocument<Notice>;

@Schema({ timestamps: true })
export class Notice {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  contents!: string;

  @Prop({ default: 0 })
  views!: number; // 조회수 (확장 제안)
}

export const NoticeSchema = SchemaFactory.createForClass(Notice);
