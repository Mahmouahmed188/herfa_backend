import { Job } from './job.entity';
import { ProviderProfile } from './provider-profile.entity';
export declare class JobAssignment {
    id: string;
    job: Job;
    jobId: string;
    provider: ProviderProfile;
    providerId: string;
    status: string;
    quotedPrice: number;
    estimatedArrival: Date;
    acceptedAt: Date;
    rejectedAt: Date;
    rejectionReason: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
