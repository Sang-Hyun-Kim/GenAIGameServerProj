import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ItemDocument = HydratedDocument<Item>;

@Schema({ timestamps: true })
export class Item {
  @Prop({ required: true, unique: true })
  itemId!: number; // 시스템 고유 아이템 ID

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: [0, 1, 2] })
  type!: number; // 0: 공격, 1: 방어, 2: 회복

  @Prop({ required: true, default: 0 })
  price!: number;

  @Prop({ default: 0 })
  attack!: number;

  @Prop({ default: 0 })
  defence!: number;

  @Prop({ default: 0 })
  mp_spend!: number;

  @Prop({ default: 0 })
  hp_recovery!: number;

  @Prop({ default: 0 })
  mp_recovery!: number;

  @Prop({ default: 0 })
  temp_attack!: number;

  @Prop({ default: 0 })
  temp_defence!: number;

  @Prop({ default: '' })
  description!: string;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
