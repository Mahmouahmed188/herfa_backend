import { Job } from './job.entity';
import { JobStatus } from '../common/constants/user.enums';
export declare class JobStatusHistory {
    id: string;
    job: Job;
    jobId: string;
    status: JobStatus;
    notes: string;
    changedBy: string;
    createdAt: Date;
}
