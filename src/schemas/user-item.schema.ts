import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, HydratedDocument } from 'mongoose';

export type UserItemDocument = HydratedDocument<UserItem>;

@Schema({ timestamps: true })
export class UserItem {
  @Prop({ type: Types.ObjectId, ref: 'Character', required: true })
  characterId!: Types.ObjectId;

  @Prop({ required: true })
  itemId!: number; // Item의 고유 itemId

  @Prop({ required: true, default: 1 })
  quantity!: number; // 소모품인 경우 수량, 장비는 보통 1

  @Prop({ default: false })
  isEquipped!: boolean; // 장비 아이템의 장착 여부
}

export const UserItemSchema = SchemaFactory.createForClass(UserItem);
