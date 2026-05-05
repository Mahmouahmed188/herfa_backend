import { ReviewsService } from './reviews.service';
import { ReviewType } from '../../common/constants/user.enums';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    create(user: any, body: {
        jobId: string;
        type: ReviewType;
        rating: number;
        comment?: string;
    }): Promise<import("../../entities").Review>;
    getProviderReviews(providerId: string, page?: number, limit?: number): Promise<{
        data: import("../../entities").Review[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
