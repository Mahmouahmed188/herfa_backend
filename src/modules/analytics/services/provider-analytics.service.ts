import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProviderProfile } from '../../../entities/provider-profile.entity';
import { Booking } from '../../../entities/booking.entity';
import { DateRangeFilterService } from './date-range-filter.service';
import { DateRangePreset } from '../dto/date-range-filter.dto';
import { ProviderAnalyticsDto } from '../dto/provider-analytics.dto';
import { User } from '../../../entities/user.entity';
import { UserRole } from '../../../common/constants/user.enums';

@Injectable()
export class ProviderAnalyticsService {
  constructor(
    @InjectRepository(ProviderProfile)
    private providerProfileRepository: Repository<ProviderProfile>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dateRangeFilterService: DateRangeFilterService,
  ) {}

  async getAnalytics(
    preset?: DateRangePreset,
    startDate?: string,
    endDate?: string,
  ): Promise<ProviderAnalyticsDto> {
    const range = this.dateRangeFilterService.resolve(preset, startDate, endDate);

    const topRatedProviders = await this.providerProfileRepository.find({
      where: { rating: { $not: null } as any },
      order: { rating: 'DESC' as any, totalJobsCompleted: 'DESC' as any },
      take: 10,
    });

    const mostBookedProviders = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.providerId', 'providerId')
      .addSelect('COALESCE(profile.businessName, \'Unknown\')', 'businessName')
      .addSelect('COALESCE(profile.rating, 0)', 'rating')
      .addSelect('COUNT(*)', 'totalJobs')
      .leftJoin(ProviderProfile, 'profile', 'profile.userId = booking.providerId')
      .where('booking.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy('booking.providerId')
      .addGroupBy('profile.businessName')
      .addGroupBy('profile.rating')
      .orderBy('totalJobs', 'DESC')
      .limit(10)
      .getRawMany<{ providerId: string; businessName: string; rating: string; totalJobs: string }>();

    const activeProviderIds = (await this.providerProfileRepository
      .createQueryBuilder('profile')
      .innerJoin(User, 'user', 'user.id = profile.userId')
      .where('user.lastLoginAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .andWhere('user.role = :role', { role: UserRole.PROVIDER })
      .select('profile.userId', 'providerId')
      .addSelect('profile.businessName', 'businessName')
      .addSelect('COALESCE(profile.rating, 0)', 'rating')
      .addSelect('profile.totalJobsCompleted', 'totalJobs')
      .orderBy('user.lastLoginAt', 'DESC')
      .limit(10)
      .getRawMany<{ providerId: string; businessName: string; rating: string; totalJobs: string }>());

    const verificationCounts = await this.providerProfileRepository
      .createQueryBuilder('profile')
      .select('profile.verificationStatus', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('profile.verificationStatus')
      .getRawMany<{ status: string; count: string }>();

    const verificationMap: Record<string, number> = {};
    for (const v of verificationCounts) {
      verificationMap[v.status] = parseInt(v.count);
    }

    const completionResult = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('COUNT(*)', 'total')
      .addSelect("COUNT(CASE WHEN booking.status = 'completed' THEN 1 END)", 'completed')
      .addSelect("COUNT(CASE WHEN booking.status = 'cancelled' THEN 1 END)", 'cancelled')
      .where('booking.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .getRawOne<{ total: string; completed: string; cancelled: string }>();

    const totalJobs = parseInt(completionResult?.total || '0');

    return {
      topRatedProviders: topRatedProviders.map((p) => ({
        providerId: p.userId || p.id,
        businessName: p.businessName,
        rating: Number(p.rating) || 0,
        totalJobs: p.totalJobsCompleted,
      })),
      mostBookedProviders: mostBookedProviders.map((p) => ({
        providerId: p.providerId,
        businessName: p.businessName,
        rating: Number(p.rating),
        totalJobs: parseInt(p.totalJobs),
      })),
      mostActiveProviders: activeProviderIds.map((p) => ({
        providerId: p.providerId,
        businessName: p.businessName,
        rating: Number(p.rating),
        totalJobs: parseInt(p.totalJobs),
      })),
      verificationCounts: {
        pending: verificationMap['pending'] || 0,
        verified: verificationMap['verified'] || 0,
        rejected: verificationMap['rejected'] || 0,
      },
      completionRate: totalJobs > 0
        ? Number(((parseInt(completionResult!.completed) / totalJobs) * 100).toFixed(1))
        : 0,
      cancellationRate: totalJobs > 0
        ? Number(((parseInt(completionResult!.cancelled) / totalJobs) * 100).toFixed(1))
        : 0,
    };
  }
}
