import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between } from 'typeorm';
import { Payment } from '../../entities/payment.entity';
import { PaymentFilterDto } from './dto/payment-filter.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async createPayment(params: {
    bookingId: string;
    customerId: string;
    providerId: string;
    amount: number;
    currency?: string;
    paymentMethod: string;
  }): Promise<Payment> {
    if (params.amount <= 0) {
      throw new BadRequestException('Amount must be greater than zero');
    }

    const paymentNumber = this.generatePaymentNumber();

    const payment = this.paymentRepository.create({
      paymentNumber,
      bookingId: params.bookingId,
      customerId: params.customerId,
      providerId: params.providerId,
      amount: params.amount,
      currency: params.currency || 'EGP',
      paymentMethod: params.paymentMethod,
      paymentStatus: 'pending',
    });

    return this.paymentRepository.save(payment);
  }

  async getCustomerPayments(
    customerId: string,
    filters: PaymentFilterDto,
  ): Promise<{ data: Payment[]; meta: any }> {
    const where: FindOptionsWhere<Payment> = { customerId };
    this.applyCommonFilters(where, filters);

    return this.getPaginatedPayments(where, filters);
  }

  async getProviderPayments(
    providerId: string,
    filters: PaymentFilterDto,
  ): Promise<{ data: Payment[]; meta: any }> {
    const where: FindOptionsWhere<Payment> = { providerId };
    this.applyCommonFilters(where, filters);

    return this.getPaginatedPayments(where, filters);
  }

  async getAllPayments(
    filters: PaymentFilterDto,
  ): Promise<{ data: Payment[]; meta: any }> {
    const where: FindOptionsWhere<Payment> = {};
    this.applyCommonFilters(where, filters);

    if (filters.customerId) {
      where.customerId = filters.customerId;
    }

    return this.getPaginatedPayments(where, filters);
  }

  async getPaymentById(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id },
      relations: ['booking', 'customer', 'provider', 'refunds'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async updatePaymentStatus(id: string, status: string): Promise<Payment> {
    const payment = await this.getPaymentById(id);
    payment.paymentStatus = status;

    if (status === 'paid') {
      payment.paidAt = new Date();
    }

    return this.paymentRepository.save(payment);
  }

  private applyCommonFilters(
    where: FindOptionsWhere<Payment>,
    filters: PaymentFilterDto,
  ): void {
    if (filters.status) {
      where.paymentStatus = filters.status;
    }

    if (filters.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.bookingId) {
      where.bookingId = filters.bookingId;
    }

    if (filters.dateFrom && filters.dateTo) {
      where.createdAt = Between(
        new Date(filters.dateFrom),
        new Date(filters.dateTo),
      );
    }

    if (filters.search) {
      where.paymentNumber = Like(`%${filters.search}%`);
    }
  }

  private async getPaginatedPayments(
    where: FindOptionsWhere<Payment>,
    filters: PaymentFilterDto,
  ): Promise<{ data: Payment[]; meta: any }> {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

    const [data, total] = await this.paymentRepository.findAndCount({
      where,
      relations: ['booking', 'customer', 'provider'],
      order: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  private generatePaymentNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PAY-${year}${month}${day}-${random}`;
  }
}
