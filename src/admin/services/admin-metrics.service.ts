import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/users.schema';
import { Character, CharacterDocument } from '../../schemas/character.schema';
import { UserItem, UserItemDocument } from '../../schemas/user-item.schema';

@Injectable()
export class AdminMetricsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Character.name) private characterModel: Model<CharacterDocument>,
    @InjectModel(UserItem.name) private userItemModel: Model<UserItemDocument>,
  ) {}

  async getSummary() {
    const [totalUsers, bannedUsers, totalCharacters, economyAgg, todayUsers] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ status: 'BANNED' }),
      this.characterModel.countDocuments(),
      this.characterModel.aggregate([
        { $group: { _id: null, totalGold: { $sum: '$gold' } } }
      ]),
      this.userModel.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      })
    ]);

    const totalGoldInServer = economyAgg.length > 0 ? economyAgg[0].totalGold : 0;

    return {
      totalUsers,
      bannedUsers,
      totalCharacters,
      totalGoldInServer,
      newUsersToday: todayUsers,
    };
  }

  async getEconomy() {
    const [goldAgg, wealthyCharacters, mostOwnedItems] = await Promise.all([
      this.characterModel.aggregate([
        { $group: { _id: null, totalGold: { $sum: '$gold' }, count: { $sum: 1 } } }
      ]),
      this.characterModel.find().sort({ gold: -1 }).limit(10).select('userId race level gold').lean(),
      this.userItemModel.aggregate([
        { $group: { _id: '$itemId', totalQuantity: { $sum: '$quantity' } } },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'items', // Assumes collection name is 'items'
            localField: '_id',
            foreignField: 'itemId',
            as: 'itemDetails'
          }
        },
        { $unwind: '$itemDetails' },
        {
          $project: {
            itemId: '$_id',
            name: '$itemDetails.name',
            totalQuantityInServer: '$totalQuantity',
            _id: 0
          }
        }
      ])
    ]);

    const averageGoldPerCharacter = goldAgg.length > 0 
      ? Math.round(goldAgg[0].totalGold / goldAgg[0].count) 
      : 0;

    return {
      averageGoldPerCharacter,
      top10WealthyCharacters: wealthyCharacters,
      mostOwnedItems,
    };
  }

  async getActivity() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [activeUsers24h, raceAgg, levelAgg] = await Promise.all([
      this.userModel.countDocuments({ lastLoginAt: { $gte: last24Hours } }),
      this.characterModel.aggregate([
        { $group: { _id: '$race', count: { $sum: 1 } } }
      ]),
      this.characterModel.aggregate([
        { $group: { _id: null, averageLevel: { $avg: '$level' } } }
      ])
    ]);

    const characterRaceDistribution: Record<string, number> = {};
    let totalRaces = 0;
    
    // First pass to get total
    raceAgg.forEach(r => { totalRaces += r.count; });
    
    // Second pass to calculate percentage
    raceAgg.forEach(r => {
      const percentage = totalRaces > 0 ? (r.count / totalRaces) * 100 : 0;
      characterRaceDistribution[String(r._id)] = Math.round(percentage * 100) / 100;
    });

    const averageLevel = levelAgg.length > 0 ? Math.round(levelAgg[0].averageLevel * 100) / 100 : 0;

    return {
      activeUsersLast24Hours: activeUsers24h,
      characterRaceDistribution,
      averageLevel,
    };
  }
}
