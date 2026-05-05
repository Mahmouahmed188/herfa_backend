import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, AcceptJobDto, RejectJobDto, JobQueryDto } from './dto/jobs.dto';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    create(user: any, dto: CreateJobDto): Promise<import("../../entities").Job>;
    getCustomerJobs(user: any, query: JobQueryDto): Promise<{
        data: import("../../entities").Job[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getProviderJobs(user: any, query: JobQueryDto): Promise<{
        data: import("../../entities").Job[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getAvailableJobs(latitude: number, longitude: number, radiusKm?: number): Promise<import("../../entities").Job[]>;
    getJob(id: string): Promise<import("../../entities").Job>;
    updateJob(id: string, user: any, dto: UpdateJobDto): Promise<import("../../entities").Job>;
    cancelJob(id: string, user: any, reason?: string): Promise<import("../../entities").Job>;
    acceptAssignment(user: any, dto: AcceptJobDto): Promise<import("../../entities").JobAssignment>;
    rejectAssignment(id: string, user: any, dto: RejectJobDto): Promise<import("../../entities").JobAssignment>;
    updateStatus(id: string, user: any, status: string): Promise<import("../../entities").Job>;
}
