import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { Job } from '../../entities/job.entity';
import { PaymentStatus } from '../../common/constants/user.enums';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Job)
    private jobRepository: Repository<Job>,
  ) {}

  async createPayment(jobId: string, customerId: string, amount: number) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found');
    if (job.customerId !== customerId) throw new BadRequestException('Not authorized');

    const platformFee = amount * 0.1;
    const providerPayout = amount - platformFee;

    const payment = this.paymentRepository.create({
      jobId,
      customerId,
      providerId: job.providerId,
      amount,
      platformFee,
      providerPayout,
      status: PaymentStatus.PENDING,
    });

    return this.paymentRepository.save(payment);
  }

  async processPayment(paymentId: string, transactionId: string) {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');

    payment.status = PaymentStatus.COMPLETED;
    payment.transactionId = transactionId;
    payment.paidAt = new Date();

    return this.paymentRepository.save(payment);
  }

  async getPaymentsByCustomer(customerId: string, page = 1, limit = 20) {
    const [payments, total] = await this.paymentRepository.findAndCount({
      where: { customerId },
      relations: ['job'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: payments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async getPaymentsByProvider(providerId: string, page = 1, limit = 20) {
    const [payments, total] = await this.paymentRepository.findAndCount({
      where: { providerId },
      relations: ['job', 'customer'],
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    return { data: payments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  async refundPayment(paymentId: string) {
    const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.COMPLETED) throw new BadRequestException('Payment not eligible for refund');

    payment.status = PaymentStatus.REFUNDED;
    payment.refundedAt = new Date();
    return this.paymentRepository.save(payment);
  }
}