import { Repository } from 'typeorm';
import { Job } from '../../entities/job.entity';
import { JobStatusHistory } from '../../entities/job-status-history.entity';
import { JobAssignment } from '../../entities/job-assignment.entity';
import { JobStatus } from '../../common/constants/user.enums';
import { CreateJobDto, UpdateJobDto, AcceptJobDto, RejectJobDto, JobQueryDto } from './dto/jobs.dto';
import { NotificationsService } from '../notifications/notifications.service';
import { type Queue } from 'bull';
export declare class JobsService {
    private jobRepository;
    private statusHistoryRepository;
    private assignmentRepository;
    private notificationsService;
    private jobsMatchingQueue;
    constructor(jobRepository: Repository<Job>, statusHistoryRepository: Repository<JobStatusHistory>, assignmentRepository: Repository<JobAssignment>, notificationsService: NotificationsService, jobsMatchingQueue: Queue);
    create(customerId: string, dto: CreateJobDto): Promise<Job>;
    findById(id: string): Promise<Job>;
    findByCustomer(customerId: string, query: JobQueryDto): Promise<{
        data: Job[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    findByProvider(providerId: string, query: JobQueryDto): Promise<{
        data: Job[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    update(id: string, customerId: string, dto: UpdateJobDto): Promise<Job>;
    cancel(id: string, customerId: string, reason?: string): Promise<Job>;
    acceptAssignment(providerId: string, dto: AcceptJobDto): Promise<JobAssignment>;
    rejectAssignment(providerId: string, assignmentId: string, dto: RejectJobDto): Promise<JobAssignment>;
    updateJobStatus(jobId: string, providerId: string, status: JobStatus): Promise<Job>;
    assignJob(jobId: string, providerId: string): Promise<JobAssignment>;
    private createStatusHistory;
    getAvailableJobs(latitude: number, longitude: number, radiusKm?: number): Promise<Job[]>;
}
