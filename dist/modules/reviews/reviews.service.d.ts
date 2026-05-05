import { Repository } from 'typeorm';
import { Review } from '../../entities/review.entity';
import { Job } from '../../entities/job.entity';
import { ReviewType } from '../../common/constants/user.enums';
export declare class ReviewsService {
    private reviewRepository;
    private jobRepository;
    constructor(reviewRepository: Repository<Review>, jobRepository: Repository<Job>);
    create(reviewerId: string, jobId: string, type: ReviewType, rating: number, comment?: string): Promise<Review>;
    getReviewsForProvider(providerId: string, page?: number, limit?: number): Promise<{
        data: Review[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    private updateProviderRating;
}
