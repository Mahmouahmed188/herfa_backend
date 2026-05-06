import { User } from './user.entity';
export declare enum VerificationStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected"
}
export declare class TechnicianVerification {
    id: string;
    userId: string;
    user: User;
    frontIdImage: string;
    backIdImage: string;
    personalPhoto: string;
    documents: string[];
    portfolio: string[];
    status: VerificationStatus;
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
}
