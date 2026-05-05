import { PaymentsService } from './payments.service';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    createPayment(user: any, body: {
        jobId: string;
        amount: number;
    }): Promise<import("../../entities").Payment>;
    processPayment(id: string, transactionId: string): Promise<import("../../entities").Payment>;
    getCustomerPayments(user: any, page?: number, limit?: number): Promise<{
        data: import("../../entities").Payment[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    refundPayment(id: string): Promise<import("../../entities").Payment>;
}
export declare class ProviderPaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    getProviderPayments(user: any, page?: number, limit?: number): Promise<{
        data: import("../../entities").Payment[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
