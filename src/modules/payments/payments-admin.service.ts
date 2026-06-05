import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PaymentsService } from './payments.service';
import { AuditService } from './services/audit.service';
import { RefundsService } from '../refunds/refunds.service';
import { Payment } from '../../entities/payment.entity';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { RefundRequestDto } from './dto/refund-request.dto';
import { isValidPaymentTransition } from '../../common/constants/payment.enums';

@Injectable()
export class PaymentsAdminService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    private readonly paymentsService: PaymentsService,
    private readonly auditService: AuditService,
    private readonly refundsService: RefundsService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async updatePaymentStatus(
    id: string,
    dto: UpdatePaymentStatusDto,
    user: any,
  ) {
    const payment = await this.paymentsService.getPaymentById(id);

    if (!isValidPaymentTransition(payment.paymentStatus, dto.status)) {
      throw new BadRequestException(
        `Invalid status transition from '${payment.paymentStatus}' to '${dto.status}'`,
      );
    }

    const previousStatus = payment.paymentStatus;

    payment.paymentStatus = dto.status;
    if (dto.status === 'paid') {
      payment.paidAt = new Date();
    }

    await this.paymentRepository.save(payment);

    await this.auditService.log({
      action: 'STATUS_UPDATED',
      entityType: 'payment',
      entityId: id,
      actorId: user.id,
      actorRole: user.role,
      metadata: {
        previousStatus,
        newStatus: dto.status,
        notes: dto.notes,
      },
    });

    this.emitPaymentEvent(dto.status, payment);
  }

  async processRefund(paymentId: string, dto: RefundRequestDto, user: any) {
    const payment = await this.paymentsService.getPaymentById(paymentId);

    if (
      payment.paymentStatus !== 'paid' &&
      payment.paymentStatus !== 'partially_refunded'
    ) {
      throw new BadRequestException(
        'Refunds are only allowed for paid payments',
      );
    }

    if (dto.amount <= 0) {
      throw new BadRequestException('Refund amount must be greater than zero');
    }

    const totalRefunded = payment.refunds
      ? payment.refunds.reduce((sum, r) => sum + Number(r.refundAmount), 0)
      : 0;

    const remaining = Number(payment.amount) - totalRefunded;

    if (dto.amount > remaining) {
      throw new BadRequestException(
        `Refund amount (${dto.amount}) exceeds remaining refundable amount (${remaining})`,
      );
    }

    const refund = await this.refundsService.createRefund({
      paymentId,
      refundAmount: dto.amount,
      refundReason: dto.reason,
      refundedBy: user.id,
    });

    const newTotalRefunded = totalRefunded + dto.amount;
    const newPaymentStatus =
      newTotalRefunded >= Number(payment.amount)
        ? 'refunded'
        : 'partially_refunded';

    payment.paymentStatus = newPaymentStatus;
    await this.paymentRepository.save(payment);

    await this.auditService.log({
      action: 'REFUND_PROCESSED',
      entityType: 'refund',
      entityId: refund.id,
      actorId: user.id,
      actorRole: user.role,
      metadata: {
        paymentId,
        refundAmount: dto.amount,
        refundReason: dto.reason,
        newPaymentStatus,
      },
    });

    this.eventEmitter.emit('refund.issued', {
      paymentId,
      bookingId: payment.bookingId,
      customerId: payment.customerId,
      providerId: payment.providerId,
      amount: dto.amount,
      currency: payment.currency,
      timestamp: new Date(),
    });

    return refund;
  }

  private emitPaymentEvent(status: string, payment: Payment): void {
    switch (status) {
      case 'paid':
        this.eventEmitter.emit('payment.completed', {
          paymentId: payment.id,
          bookingId: payment.bookingId,
          customerId: payment.customerId,
          providerId: payment.providerId,
          amount: payment.amount,
          currency: payment.currency,
          timestamp: new Date(),
        });
        break;
      case 'failed':
        this.eventEmitter.emit('payment.failed', {
          paymentId: payment.id,
          bookingId: payment.bookingId,
          customerId: payment.customerId,
          providerId: payment.providerId,
          amount: payment.amount,
          currency: payment.currency,
          timestamp: new Date(),
        });
        break;
      case 'cancelled':
        this.eventEmitter.emit('payment.cancelled', {
          paymentId: payment.id,
          bookingId: payment.bookingId,
          customerId: payment.customerId,
          providerId: payment.providerId,
          amount: payment.amount,
          currency: payment.currency,
          timestamp: new Date(),
        });
        break;
    }
  }
}
