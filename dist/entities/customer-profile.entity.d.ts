import { User } from './user.entity';
import { Job } from './job.entity';
export declare class CustomerProfile {
    id: string;
    user: User;
    userId: string;
    defaultAddress: string;
    defaultLatitude: number;
    defaultLongitude: number;
    preferredLanguage: string;
    preferredCurrency: string;
    jobs: Job[];
    createdAt: Date;
    updatedAt: Date;
}
