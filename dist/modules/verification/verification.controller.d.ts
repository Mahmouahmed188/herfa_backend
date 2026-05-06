import { VerificationService } from './verification.service';
import { VerificationStatus } from '../../entities/technician-verification.entity';
export declare class VerificationController {
    private readonly verificationService;
    constructor(verificationService: VerificationService);
    submit(user: any, data: any): Promise<import("../../entities/technician-verification.entity").TechnicianVerification[]>;
    getStatus(user: any): Promise<import("../../entities/technician-verification.entity").TechnicianVerification | {
        status: string;
    }>;
    review(id: string, status: VerificationStatus, adminNote?: string): Promise<import("../../entities/technician-verification.entity").TechnicianVerification>;
}
