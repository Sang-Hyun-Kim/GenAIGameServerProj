import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Model, HydratedDocument } from 'mongoose';
import * as bcrypt from 'bcrypt';

// HydratedDocument를 사용하여 더 정확한 문서 타입을 정의합니다.
export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  toJSON: {
    // ret의 타입을 Record<string, any>로 지정하여 동적 속성 접근 에러를 해결합니다.
    transform: (_doc, ret: Record<string, any>) => {
      delete ret.password;
      delete ret.__v;
      return ret;
    },
  },
})
export class User {
  @Prop({ required: true })
  firstName!: string;

  @Prop({ required: true })
  lastName!: string;

  @Prop({ required: true, unique: true, index: true })
  email!: string;

  @Prop({ required: true, select: false })
  password!: string;

  @Prop({ default: false })
  isAdmin!: boolean;

  @Prop({ required: true, enum: ['ACTIVE', 'BANNED'], default: 'ACTIVE' })
  status!: string;

  @Prop({ type: Date, default: Date.now })
  lastLoginAt!: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
 * [해결] 비밀번호 해싱 미들웨어 타입 지정
 * 'this'의 타입을 UserDocument로 명시하여 속성 접근 에러를 해결합니다.
 */
UserSchema.pre<UserDocument>('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  // async 함수 내부에서는 에러가 발생하면 자동으로 Promise가 reject 되므로,
  // try-catch와 next()를 사용할 필요 없이 Mongoose가 에러를 처리합니다.
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/**
 * [해결] UserQueries 타입 최적화
 * Model<UserDocument> 타입을 사용하여 타입 추론을 지원합니다.
 */
export const UserQueries = {
  // 1. 신규 사용자 등록
  register: (model: Model<UserDocument>, userData: Partial<User>) => {
    return new model(userData).save();
  },

  // 2. 로그인용 사용자 조회
  login: (model: Model<UserDocument>, email: string) => {
    return model.findOne({ email }).select('+password');
  },

  // 4. 내 프로필 조회
  findById: (model: Model<UserDocument>, id: string) => {
    return model.findById(id);
  },

  // 5. 전체 사용자 목록 조회
  findAll: (model: Model<UserDocument>) => {
    return model.find();
  },

  // 6. 특정 사용자 정보 수정
  update: (
    model: Model<UserDocument>,
    id: string,
    updateData: Partial<User>,
  ) => {
    return model.findByIdAndUpdate(id, updateData, { new: true });
  },

  // 7. 특정 사용자 삭제
  delete: (model: Model<UserDocument>, id: string) => {
    return model.findByIdAndDelete(id);
  },
};
