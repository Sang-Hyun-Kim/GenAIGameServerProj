import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../schemas/users.schema';
import { Character, CharacterSchema } from '../schemas/character.schema';
import { Item, ItemSchema } from '../schemas/item.schema';
import { UserItem, UserItemSchema } from '../schemas/user-item.schema';
import { AdminUsersController } from './controllers/admin-users.controller';
import { AdminItemsController } from './controllers/admin-items.controller';
import { AdminMetricsController } from './controllers/admin-metrics.controller';
import { AdminUsersService } from './services/admin-users.service';
import { AdminItemsService } from './services/admin-items.service';
import { AdminMetricsService } from './services/admin-metrics.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Character.name, schema: CharacterSchema },
      { name: Item.name, schema: ItemSchema },
      { name: UserItem.name, schema: UserItemSchema },
    ]),
  ],
  controllers: [
    AdminUsersController,
    AdminItemsController,
    AdminMetricsController,
  ],
  providers: [AdminUsersService, AdminItemsService, AdminMetricsService],
})
export class AdminModule {}
