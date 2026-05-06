import { User } from './user.entity';
import { Service } from './service.entity';
import { TenderOffer } from './tender-offer.entity';
export declare enum TenderStatus {
    OPEN = "open",
    CLOSED = "closed",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    EXPIRED = "expired"
}
export declare class Tender {
    id: string;
    user: User;
    userId: string;
    service: Service;
    serviceId: string;
    title: string;
    description: string;
    status: string;
    budgetMin: number;
    budgetMax: number;
    address: string;
    deadline: Date;
    images: string[];
    acceptedOfferId: string;
    offers: TenderOffer[];
    createdAt: Date;
    updatedAt: Date;
}
