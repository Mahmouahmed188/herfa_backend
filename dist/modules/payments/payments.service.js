"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_entity_1 = require("../../entities/payment.entity");
const job_entity_1 = require("../../entities/job.entity");
const user_enums_1 = require("../../common/constants/user.enums");
let PaymentsService = class PaymentsService {
    paymentRepository;
    jobRepository;
    constructor(paymentRepository, jobRepository) {
        this.paymentRepository = paymentRepository;
        this.jobRepository = jobRepository;
    }
    async createPayment(jobId, customerId, amount) {
        const job = await this.jobRepository.findOne({ where: { id: jobId } });
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        if (job.customerId !== customerId)
            throw new common_1.BadRequestException('Not authorized');
        const platformFee = amount * 0.1;
        const providerPayout = amount - platformFee;
        const payment = this.paymentRepository.create({
            jobId,
            customerId,
            providerId: job.providerId,
            amount,
            platformFee,
            providerPayout,
            status: user_enums_1.PaymentStatus.PENDING,
        });
        return this.paymentRepository.save(payment);
    }
    async processPayment(paymentId, transactionId) {
        const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        payment.status = user_enums_1.PaymentStatus.COMPLETED;
        payment.transactionId = transactionId;
        payment.paidAt = new Date();
        return this.paymentRepository.save(payment);
    }
    async getPaymentsByCustomer(customerId, page = 1, limit = 20) {
        const [payments, total] = await this.paymentRepository.findAndCount({
            where: { customerId },
            relations: ['job'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data: payments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
    async getPaymentsByProvider(providerId, page = 1, limit = 20) {
        const [payments, total] = await this.paymentRepository.findAndCount({
            where: { providerId },
            relations: ['job', 'customer'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data: payments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
    async refundPayment(paymentId) {
        const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
        if (!payment)
            throw new common_1.NotFoundException('Payment not found');
        if (payment.status !== user_enums_1.PaymentStatus.COMPLETED)
            throw new common_1.BadRequestException('Payment not eligible for refund');
        payment.status = user_enums_1.PaymentStatus.REFUNDED;
        payment.refundedAt = new Date();
        return this.paymentRepository.save(payment);
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map