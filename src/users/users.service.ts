import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User, UserDocument } from '../schemas/users.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { CharactersService } from '../characters/characters.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject(forwardRef(() => JwtService)) private jwtService: JwtService,
    @Inject(forwardRef(() => CharactersService))
    private charactersService: CharactersService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.userModel.findOne({
      email: createUserDto.email,
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }
    const createdUser = new this.userModel(createUserDto);
    return createdUser.save();
  }

  async login(
    loginDto: LoginUserDto,
  ): Promise<{ access_token: string; user: any }> {
    // 1. 유저 찾기 (패스워드 포함해서 가져오기)
    const user = await this.userModel
      .findOne({ email: loginDto.email })
      .select('+password')
      .exec();
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2. 패스워드 검증
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 2.5 계정 정지 여부 확인
    if (user.status === 'BANNED') {
      throw new UnauthorizedException('This account has been banned.');
    }

    // 2.6 최근 접속일 갱신
    user.lastLoginAt = new Date();
    await user.save();

    // 3. JWT 페이로드 생성 및 토큰 발급
    const payload = {
      email: user.email,
      sub: user._id.toString(),
      isAdmin: user.isAdmin,
    };
    const accessToken = this.jwtService.sign(payload);

    // 응답에서 패스워드를 제외한 유저 정보를 반환
    const userObj = user.toObject();
    delete (userObj as any).password;

    return {
      access_token: accessToken,
      user: userObj,
    };
  }

  async findByEmailForLogin(
    loginDto: LoginUserDto,
  ): Promise<UserDocument | null> {
    return this.userModel
      .findOne({ email: loginDto.email })
      .select('+password')
      .exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
    if (!updatedUser) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return updatedUser;
  }

  async remove(id: string): Promise<{ deleted: boolean; message: string }> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    // 해당 사용자의 모든 캐릭터 삭제 (연쇄 삭제)
    await this.charactersService.removeByUserId(id);

    return {
      deleted: true,
      message: 'User and associated characters successfully deleted',
    };
  }
}
