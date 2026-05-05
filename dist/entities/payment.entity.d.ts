import { Job } from './job.entity';
import { User } from './user.entity';
export declare class Payment {
    id: string;
    job: Job;
    jobId: string;
    customer: User;
    customerId: string;
    provider: User;
    providerId: string;
    amount: number;
    platformFee: number;
    providerPayout: number;
    status: string;
    paymentMethod: string;
    transactionId: string;
    stripePaymentIntentId: string;
    stripeTransferId: string;
    paidAt: Date;
    failedAt: Date;
    refundedAt: Date;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
