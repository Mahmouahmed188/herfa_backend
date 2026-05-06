import { User } from './user.entity';
import { Tender } from './tender.entity';
export declare enum OfferStatus {
    PENDING = "pending",
    ACCEPTED = "accepted",
    REJECTED = "rejected"
}
export declare class TenderOffer {
    id: string;
    tender: Tender;
    tenderId: string;
    provider: User;
    providerId: string;
    price: number;
    message: string;
    estimatedDays: number;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
