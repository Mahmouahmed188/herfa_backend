import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Review } from '../../entities/review.entity';
import { Booking } from '../../entities/booking.entity';
import { BookingStatus } from '../../entities/booking.entity';
import { ProviderRatingStats } from '../../entities/provider-rating-stats.entity';
import { ModerationLog } from '../../entities/moderation-log.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ProviderRatingStatsResponseDto } from './dto/provider-rating-stats-response.dto';
import { ModerationLogResponseDto } from './dto/moderation-log-response.dto';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(ProviderRatingStats)
    private statsRepository: Repository<ProviderRatingStats>,
    @InjectRepository(ModerationLog)
    private moderationLogRepository: Repository<ModerationLog>,
    @InjectRepository(ProviderProfile)
    private providerProfileRepository: Repository<ProviderProfile>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(customerId: string, dto: CreateReviewDto): Promise<Review> {
    const booking = await this.bookingRepository.findOne({
      where: { id: dto.bookingId },
      relations: ['provider'],
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.status !== BookingStatus.COMPLETED) {
      throw new BadRequestException('Can only review completed bookings');
    }
    if (booking.customerId !== customerId) {
      throw new BadRequestException('You can only review your own bookings');
    }

    const existing = await this.reviewRepository.findOne({
      where: { bookingId: dto.bookingId },
    });
    if (existing) throw new BadRequestException('You have already reviewed this booking');

    const now = new Date();
    const editableUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const review = this.reviewRepository.create({
      bookingId: dto.bookingId,
      customerId,
      providerId: booking.providerId,
      rating: dto.rating,
      comment: dto.comment,
      isVisible: true,
      editableUntil,
    });

    const saved = await this.reviewRepository.save(review);
    await this.updateProviderRatingStats(booking.providerId);
    this.emitReviewEvent('created', saved);
    this.logger.log(`Review ${saved.id} created for booking ${dto.bookingId}`);
    return saved;
  }

  async findAllByCustomer(customerId: string, filter: ReviewFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const query = this.reviewRepository.createQueryBuilder('review')
      .where('review.customerId = :customerId', { customerId })
      .andWhere('review.isVisible = :isVisible', { isVisible: true })
      .skip((page - 1) * limit)
      .take(limit);

    if (filter.rating) {
      query.andWhere('review.rating = :rating', { rating: filter.rating });
    }

    const order = filter.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    if (filter.sortBy === 'rating') {
      query.orderBy('review.rating', order);
    } else {
      query.orderBy('review.createdAt', order);
    }

    const [reviews, total] = await query.getManyAndCount();
    return {
      data: reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<Review> {
    const review = await this.reviewRepository.findOne({ where: { id } });
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async getProviderReviews(providerId: string, filter: ReviewFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const query = this.reviewRepository.createQueryBuilder('review')
      .where('review.providerId = :providerId', { providerId })
      .andWhere('review.isVisible = :isVisible', { isVisible: true })
      .skip((page - 1) * limit)
      .take(limit);

    if (filter.rating) {
      query.andWhere('review.rating = :rating', { rating: filter.rating });
    }

    const order = filter.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    if (filter.sortBy === 'rating') {
      query.orderBy('review.rating', order);
    } else {
      query.orderBy('review.createdAt', order);
    }

    const [reviews, total] = await query.getManyAndCount();
    return {
      data: reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProviderStats(providerId: string): Promise<ProviderRatingStatsResponseDto> {
    let stats = await this.statsRepository.findOne({ where: { providerId } });
    if (!stats) {
      return {
        providerId,
        averageRating: 0,
        totalReviews: 0,
        fiveStarCount: 0,
        fourStarCount: 0,
        threeStarCount: 0,
        twoStarCount: 0,
        oneStarCount: 0,
      };
    }
    return {
      providerId: stats.providerId,
      averageRating: Number(stats.averageRating),
      totalReviews: stats.totalReviews,
      fiveStarCount: stats.fiveStarCount,
      fourStarCount: stats.fourStarCount,
      threeStarCount: stats.threeStarCount,
      twoStarCount: stats.twoStarCount,
      oneStarCount: stats.oneStarCount,
    };
  }

  async getPublicProviderReviews(providerId: string, filter: ReviewFilterDto) {
    return this.getProviderReviews(providerId, filter);
  }

  async getPublicProviderStats(providerId: string): Promise<ProviderRatingStatsResponseDto> {
    return this.getProviderStats(providerId);
  }

  async adminFindAll(filter: ReviewFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const query = this.reviewRepository.createQueryBuilder('review')
      .skip((page - 1) * limit)
      .take(limit);

    const order = filter.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    query.orderBy('review.createdAt', order);

    const [reviews, total] = await query.getManyAndCount();
    return {
      data: reviews,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async adminRemoveReview(reviewId: string, adminId: string, reason?: string): Promise<void> {
    const review = await this.findOne(reviewId);

    review.isVisible = false;
    review.removedByAdmin = true;
    review.adminRemovalReason = reason || null;
    review.removedAt = new Date();
    await this.reviewRepository.save(review);

    const log = this.moderationLogRepository.create({
      reviewId,
      adminId,
      action: 'removed',
      reason: reason || null,
    });
    await this.moderationLogRepository.save(log);

    await this.updateProviderRatingStats(review.providerId);
    this.emitReviewEvent('removed', review, { reason: reason || 'admin_removed' });
    this.logger.log(`Admin ${adminId} removed review ${reviewId}: ${reason}`);
  }

  async getModerationLog(filter: ReviewFilterDto) {
    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;
    const query = this.moderationLogRepository.createQueryBuilder('log')
      .leftJoinAndSelect('log.admin', 'admin')
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('log.createdAt', 'DESC');

    const [logs, total] = await query.getManyAndCount();
    const data = logs.map((log) => ({
      id: log.id,
      reviewId: log.reviewId,
      adminId: log.adminId,
      adminName: log.admin ? `${log.admin.firstName || ''} ${log.admin.lastName || ''}`.trim() : 'Unknown',
      action: log.action,
      reason: log.reason,
      createdAt: log.createdAt,
    }));
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(reviewId: string, userId: string, dto: UpdateReviewDto): Promise<Review> {
    const review = await this.findOne(reviewId);

    if (review.customerId !== userId) {
      throw new BadRequestException('You can only edit your own reviews');
    }

    const now = new Date();
    if (review.editableUntil && now > review.editableUntil) {
      throw new BadRequestException('Review can only be edited within 24 hours of submission');
    }

    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;

    const saved = await this.reviewRepository.save(review);
    await this.updateProviderRatingStats(review.providerId);
    this.emitReviewEvent('updated', saved);
    this.logger.log(`Review ${reviewId} updated by customer ${userId}`);
    return saved;
  }

  async delete(reviewId: string, userId: string): Promise<void> {
    const review = await this.findOne(reviewId);

    if (review.customerId !== userId) {
      throw new BadRequestException('You can only delete your own reviews');
    }

    const now = new Date();
    if (review.editableUntil && now > review.editableUntil) {
      throw new BadRequestException('Review can only be deleted within 24 hours of submission');
    }

    const providerId = review.providerId;
    await this.reviewRepository.remove(review);
    await this.updateProviderRatingStats(providerId);
    this.emitReviewEvent('removed', { ...review, providerId }, { reason: 'customer_deleted' });
    this.logger.log(`Review ${reviewId} deleted by customer ${userId}`);
  }

  private async updateProviderRatingStats(providerId: string): Promise<void> {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .addSelect('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN review.rating = 5 THEN 1 ELSE 0 END)', 'five')
      .addSelect('SUM(CASE WHEN review.rating = 4 THEN 1 ELSE 0 END)', 'four')
      .addSelect('SUM(CASE WHEN review.rating = 3 THEN 1 ELSE 0 END)', 'three')
      .addSelect('SUM(CASE WHEN review.rating = 2 THEN 1 ELSE 0 END)', 'two')
      .addSelect('SUM(CASE WHEN review.rating = 1 THEN 1 ELSE 0 END)', 'one')
      .where('review.providerId = :providerId', { providerId })
      .andWhere('review.isVisible = :isVisible', { isVisible: true })
      .getRawOne();

    const avg = result?.avg ? parseFloat(Number(result.avg).toFixed(2)) : 0;
    const total = result?.total ? parseInt(result.total, 10) : 0;

    const stats = await this.statsRepository.findOne({ where: { providerId } });
    if (stats) {
      stats.averageRating = avg;
      stats.totalReviews = total;
      stats.fiveStarCount = parseInt(result?.five || '0', 10);
      stats.fourStarCount = parseInt(result?.four || '0', 10);
      stats.threeStarCount = parseInt(result?.three || '0', 10);
      stats.twoStarCount = parseInt(result?.two || '0', 10);
      stats.oneStarCount = parseInt(result?.one || '0', 10);
      await this.statsRepository.save(stats);
    } else {
      const newStats = this.statsRepository.create({
        providerId,
        averageRating: avg,
        totalReviews: total,
        fiveStarCount: parseInt(result?.five || '0', 10),
        fourStarCount: parseInt(result?.four || '0', 10),
        threeStarCount: parseInt(result?.three || '0', 10),
        twoStarCount: parseInt(result?.two || '0', 10),
        oneStarCount: parseInt(result?.one || '0', 10),
      });
      await this.statsRepository.save(newStats);
    }

    await this.providerProfileRepository.update(
      { userId: providerId },
      { rating: avg },
    );
  }

  private emitReviewEvent(eventName: string, review: Partial<Review>, extra?: Record<string, unknown>): void {
    this.eventEmitter.emit(`review.${eventName}`, {
      event: `review.${eventName}`,
      timestamp: new Date().toISOString(),
      data: {
        reviewId: review.id,
        bookingId: review.bookingId,
        customerId: review.customerId,
        providerId: review.providerId,
        rating: review.rating,
        comment: review.comment,
        ...extra,
      },
    });
  }
}