import { Repository } from 'typeorm';
import { TechnicianVerification, VerificationStatus } from '../../entities/technician-verification.entity';
import { User } from '../../entities/user.entity';
export declare class VerificationService {
    private verificationRepository;
    private userRepository;
    constructor(verificationRepository: Repository<TechnicianVerification>, userRepository: Repository<User>);
    submitVerification(userId: string, data: any): Promise<TechnicianVerification[]>;
    getStatus(userId: string): Promise<TechnicianVerification | {
        status: string;
    }>;
    reviewVerification(id: string, status: VerificationStatus, adminNote?: string): Promise<TechnicianVerification>;
}
