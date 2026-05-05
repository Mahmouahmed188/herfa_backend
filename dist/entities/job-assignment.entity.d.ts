import { Job } from './job.entity';
import { ProviderProfile } from './provider-profile.entity';
import { JobAssignmentStatus } from '../common/constants/user.enums';
export declare class JobAssignment {
    id: string;
    job: Job;
    jobId: string;
    provider: ProviderProfile;
    providerId: string;
    status: JobAssignmentStatus;
    quotedPrice: number;
    estimatedArrival: Date;
    acceptedAt: Date;
    rejectedAt: Date;
    rejectionReason: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date;
}
