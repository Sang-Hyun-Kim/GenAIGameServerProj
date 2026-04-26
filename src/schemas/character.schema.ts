import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './users.schema';

export type CharacterDocument = Character & Document;

@Schema({ timestamps: true })
export class Character {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, maxlength: 20 })
  name!: string;

  @Prop({ required: true, enum: [0, 1, 2] })
  race!: number; // 0 = 용족, 1 = 엘프, 2 = 인간족

  @Prop({ default: 0 })
  gold!: number;

  @Prop({ default: 0 })
  hp!: number;

  @Prop({ default: 0 })
  mp!: number;

  @Prop({ default: 0 })
  exp!: number;

  @Prop({ default: 0 })
  level!: number;

  @Prop({ default: 0 })
  attack_point!: number;

  @Prop({ default: 0 })
  defence_point!: number;

  @Prop({ type: Number, default: null })
  attack_item_id!: number | null;

  @Prop({ type: Number, default: null })
  defence_item1_id!: number | null;

  @Prop({ type: Number, default: null })
  defence_item2_id!: number | null;

  @Prop({ type: Number, default: null })
  defence_item3_id!: number | null;

  @Prop({ type: Number, default: null })
  defence_item4_id!: number | null;
}

export const CharacterSchema = SchemaFactory.createForClass(Character);
