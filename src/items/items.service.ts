import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from '../schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item.name) private itemModel: Model<ItemDocument>) {}

  async create(createItemDto: CreateItemDto): Promise<Item> {
    const existing = await this.itemModel
      .findOne({ itemId: createItemDto.itemId })
      .exec();
    if (existing) {
      throw new ConflictException(
        `Item with ID ${createItemDto.itemId} already exists`,
      );
    }
    const createdItem = new this.itemModel(createItemDto);
    return createdItem.save();
  }

  async findAll(): Promise<Item[]> {
    return this.itemModel.find().exec();
  }

  async findOne(itemId: number): Promise<Item> {
    const item = await this.itemModel.findOne({ itemId }).exec();
    if (!item) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }
    return item;
  }

  async update(itemId: number, updateItemDto: UpdateItemDto): Promise<Item> {
    const updated = await this.itemModel
      .findOneAndUpdate({ itemId }, updateItemDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }
    return updated;
  }

  async remove(itemId: number): Promise<void> {
    const result = await this.itemModel.deleteOne({ itemId }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Item with ID ${itemId} not found`);
    }
  }
}
