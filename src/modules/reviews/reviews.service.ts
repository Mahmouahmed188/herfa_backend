import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../../entities/review.entity';
import { Job } from '../../entities/job.entity';
import { ReviewType, JobStatus } from '../../common/constants/user.enums';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async create(reviewerId: string, jobId: string, type: ReviewType, rating: number, comment?: string) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.status !== JobStatus.COMPLETED) throw new BadRequestException('Can only review completed jobs');

    const revieweeId = type === ReviewType.CUSTOMER_TO_PROVIDER ? job.providerId : job.customerId;
    if (!revieweeId) throw new BadRequestException('Job does not have a reviewee');

    const existingReview = await this.reviewRepository.findOne({
      where: { jobId, reviewerId, type },
    });
    if (existingReview) throw new BadRequestException('You have already reviewed this job');

    const review = this.reviewRepository.create({
      jobId,
      reviewerId,
      revieweeId,
      type,
      rating,
      comment,
    });

    const saved = await this.reviewRepository.save(review);
    await this.updateProviderRating(job.providerId);
    return saved;
  }

  async getReviewsForProvider(providerId: string, page = 1, limit = 20) {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { revieweeId: providerId, type: ReviewType.CUSTOMER_TO_PROVIDER, isVisible: true },
      relations: ['reviewer', 'job'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: reviews, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  private async updateProviderRating(providerId: string) {
    const result = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'avg')
      .where('review.revieweeId = :providerId', { providerId })
      .andWhere('review.type = :type', { type: ReviewType.CUSTOMER_TO_PROVIDER })
      .getRawOne();

    if (result && result.avg) {
      await this.jobRepository.manager.query(
        `UPDATE provider_profiles SET rating = $1 WHERE user_id = $2`,
        [parseFloat(result.avg).toFixed(2), providerId],
      );
    }
  }
}