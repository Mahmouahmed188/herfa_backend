import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { UserRole } from '../../../common/constants/user.enums';
import { DateRangeFilterService } from './date-range-filter.service';
import { DateRangePreset } from '../dto/date-range-filter.dto';
import { UserAnalyticsDto } from '../dto/user-analytics.dto';

@Injectable()
export class UserAnalyticsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dateRangeFilterService: DateRangeFilterService,
  ) {}

  async getAnalytics(
    preset?: DateRangePreset,
    startDate?: string,
    endDate?: string,
  ): Promise<UserAnalyticsDto> {
    const range = this.dateRangeFilterService.resolve(preset, startDate, endDate);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newUsersToday = await this.userRepository.count({
      where: { createdAt: MoreThanOrEqual(todayStart) },
    });

    const newUsersThisWeek = await this.userRepository.count({
      where: { createdAt: MoreThanOrEqual(weekStart) },
    });

    const newUsersThisMonth = await this.userRepository.count({
      where: { createdAt: MoreThanOrEqual(monthStart) },
    });

    const priorPeriodStart = new Date(
      range.startDate.getTime() - (range.endDate.getTime() - range.startDate.getTime()),
    );

    const currentCustomers = await this.userRepository.count({
      where: { role: UserRole.CUSTOMER, createdAt: Between(range.startDate, range.endDate) },
    });
    const priorCustomers = await this.userRepository.count({
      where: { role: UserRole.CUSTOMER, createdAt: Between(priorPeriodStart, range.startDate) },
    });
    const customerGrowthRate = priorCustomers > 0
      ? Number((((currentCustomers - priorCustomers) / priorCustomers) * 100).toFixed(1))
      : 0;

    const currentProviders = await this.userRepository.count({
      where: { role: UserRole.PROVIDER, createdAt: Between(range.startDate, range.endDate) },
    });
    const priorProviders = await this.userRepository.count({
      where: { role: UserRole.PROVIDER, createdAt: Between(priorPeriodStart, range.startDate) },
    });
    const providerGrowthRate = priorProviders > 0
      ? Number((((currentProviders - priorProviders) / priorProviders) * 100).toFixed(1))
      : 0;

    const activeUsers = await this.userRepository.count({
      where: { lastLoginAt: MoreThanOrEqual(range.startDate) },
    });

    const inactiveUsers = await this.userRepository.count({
      where: [
        { lastLoginAt: LessThanOrEqual(range.startDate) },
        { lastLoginAt: null as any },
      ],
    });

    return {
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      customerGrowthRate,
      providerGrowthRate,
      activeUsers,
      inactiveUsers,
    };
  }
}
