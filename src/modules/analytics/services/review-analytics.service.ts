import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../../entities/review.entity';
import { ServiceCategory } from '../../../entities/service-category.entity';
import { DateRangeFilterService } from './date-range-filter.service';
import { DateRangePreset } from '../dto/date-range-filter.dto';
import { ReviewAnalyticsDto } from '../dto/review-analytics.dto';

@Injectable()
export class ReviewAnalyticsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ServiceCategory)
    private categoryRepository: Repository<ServiceCategory>,
    private dateRangeFilterService: DateRangeFilterService,
  ) {}

  async getAnalytics(
    preset?: DateRangePreset,
    startDate?: string,
    endDate?: string,
  ): Promise<ReviewAnalyticsDto> {
    const range = this.dateRangeFilterService.resolve(preset, startDate, endDate);

    const avgRatingResult = await this.reviewRepository
      .createQueryBuilder('review')
      .select('COALESCE(AVG(review.rating), 0)', 'average')
      .where('review.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .getRawOne<{ average: string }>();

    const reviewsPerDay = await this.reviewRepository
      .createQueryBuilder('review')
      .select('COUNT(*)', 'count')
      .where('review.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .getRawOne<{ count: string }>();

    const daysDiff = Math.max(
      1,
      Math.ceil((range.endDate.getTime() - range.startDate.getTime()) / (1000 * 60 * 60 * 24)),
    );
    const dailyAverage = reviewsPerDay
      ? Number((parseInt(reviewsPerDay.count) / daysDiff).toFixed(1))
      : 0;

    const reviewsPerMonth = await this.reviewRepository
      .createQueryBuilder('review')
      .select('COUNT(*)', 'count')
      .where('review.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .getRawOne<{ count: string }>();

    const monthsDiff = Math.max(1, Math.ceil(daysDiff / 30));
    const monthlyAverage = reviewsPerMonth
      ? Number((parseInt(reviewsPerMonth.count) / monthsDiff).toFixed(1))
      : 0;

    const topRatedCategories = await this.reviewRepository
      .createQueryBuilder('review')
      .select('COALESCE(category.name, \'Unknown\')', 'category')
      .addSelect('AVG(review.rating)', 'averageRating')
      .leftJoin('review.booking', 'booking')
      .leftJoin('booking.service', 'service')
      .leftJoin('service.category', 'category')
      .where('review.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy('category.name')
      .having('COUNT(*) > 0')
      .orderBy('averageRating', 'DESC')
      .limit(10)
      .getRawMany<{ category: string; averageRating: string }>();

    const ratingDistributionRaw = await this.reviewRepository
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy('review.rating')
      .orderBy('review.rating', 'ASC')
      .getRawMany<{ rating: string; count: string }>();

    const ratingDist: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
    for (const row of ratingDistributionRaw) {
      ratingDist[row.rating] = parseInt(row.count);
    }

    return {
      averageRating: Number(avgRatingResult?.average || 0),
      reviewsPerDay: dailyAverage,
      reviewsPerMonth: monthlyAverage,
      topRatedCategories: topRatedCategories.map((c) => ({
        category: c.category,
        averageRating: Number(Number(c.averageRating).toFixed(1)),
      })),
      ratingDistribution: ratingDist as any,
    };
  }
}
