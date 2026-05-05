import { Job } from './job.entity';
import { User } from './user.entity';
import { ReviewType } from '../common/constants/user.enums';
export declare class Review {
    id: string;
    job: Job;
    jobId: string;
    reviewer: User;
    reviewerId: string;
    reviewee: User;
    revieweeId: string;
    type: ReviewType;
    rating: number;
    comment: string;
    images: string[];
    isVisible: boolean;
    createdAt: Date;
}
