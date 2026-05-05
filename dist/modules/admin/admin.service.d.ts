import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ProviderApplication } from '../../entities/provider-application.entity';
import { Job } from '../../entities/job.entity';
import { Payment } from '../../entities/payment.entity';
import { UserStatus } from '../../common/constants/user.enums';
export declare class AdminService {
    private userRepository;
    private applicationRepository;
    private jobRepository;
    private paymentRepository;
    constructor(userRepository: Repository<User>, applicationRepository: Repository<ProviderApplication>, jobRepository: Repository<Job>, paymentRepository: Repository<Payment>);
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalProviders: number;
        totalCustomers: number;
        activeJobs: number;
        completedJobs: number;
        totalRevenue: any;
    }>;
    getAllUsers(page?: number, limit?: number, role?: string, status?: string): Promise<{
        data: User[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPendingApplications(page?: number, limit?: number): Promise<{
        data: ProviderApplication[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    approveApplication(applicationId: string): Promise<{
        message: string;
    }>;
    rejectApplication(applicationId: string, reason: string): Promise<ProviderApplication>;
    updateUserStatus(userId: string, status: UserStatus): Promise<{
        message: string;
    }>;
    getAllJobs(page?: number, limit?: number, status?: string): Promise<{
        data: Job[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
