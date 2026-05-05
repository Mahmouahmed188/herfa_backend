import { AdminService } from './admin.service';
import { UserStatus } from '../../common/constants/user.enums';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getDashboardStats(): Promise<{
        totalUsers: number;
        totalProviders: number;
        totalCustomers: number;
        activeJobs: number;
        completedJobs: number;
        totalRevenue: any;
    }>;
    getAllUsers(page?: number, limit?: number, role?: string, status?: string): Promise<{
        data: import("../../entities").User[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    updateUserStatus(id: string, status: UserStatus): Promise<{
        message: string;
    }>;
    getPendingApplications(page?: number, limit?: number): Promise<{
        data: import("../../entities").ProviderApplication[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    approveApplication(id: string): Promise<{
        message: string;
    }>;
    rejectApplication(id: string, reason: string): Promise<import("../../entities").ProviderApplication>;
    getAllJobs(page?: number, limit?: number, status?: string): Promise<{
        data: import("../../entities").Job[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
