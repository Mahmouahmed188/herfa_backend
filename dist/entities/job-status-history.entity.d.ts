import { Job } from './job.entity';
export declare class JobStatusHistory {
    id: string;
    job: Job;
    jobId: string;
    status: string;
    notes: string;
    changedBy: string;
    createdAt: Date;
}
