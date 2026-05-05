import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { Job } from '../../entities/job.entity';
export declare class PaymentsService {
    private paymentRepository;
    private jobRepository;
    constructor(paymentRepository: Repository<Payment>, jobRepository: Repository<Job>);
    createPayment(jobId: string, customerId: string, amount: number): Promise<Payment>;
    processPayment(paymentId: string, transactionId: string): Promise<Payment>;
    getPaymentsByCustomer(customerId: string, page?: number, limit?: number): Promise<{
        data: Payment[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getPaymentsByProvider(providerId: string, page?: number, limit?: number): Promise<{
        data: Payment[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    refundPayment(paymentId: string): Promise<Payment>;
}
