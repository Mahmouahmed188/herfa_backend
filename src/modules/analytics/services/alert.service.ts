import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { Booking } from '../../../entities/booking.entity';
import { Payment } from '../../../entities/payment.entity';
import { User } from '../../../entities/user.entity';
import { SupportTicket } from '../../../entities/support-ticket.entity';
import {
  PaymentStatus,
  UserRole,
  UserStatus,
} from '../../../common/constants/user.enums';
import { BookingStatus } from '../../../entities/booking.entity';
import { OperationalAlertDto } from '../dto/operational-alert.dto';

interface AlertThresholds {
  bookingFailureRate: number;
  paymentFailureCount: number;
  refundVolume: number;
  suspiciousRegistrationRate: number;
  providerSuspensionCount: number;
  supportTicketSpike: number;
}

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private readonly thresholds: AlertThresholds = {
    bookingFailureRate: 10,
    paymentFailureCount: 20,
    refundVolume: 10000,
    suspiciousRegistrationRate: 50,
    providerSuspensionCount: 5,
    supportTicketSpike: 30,
  };

  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SupportTicket)
    private supportTicketRepository: Repository<SupportTicket>,
  ) {}

  async check(): Promise<OperationalAlertDto[]> {
    const alerts: OperationalAlertDto[] = [];
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const bookingFailureAlert = await this.checkBookingFailures(oneHourAgo);
    if (bookingFailureAlert) alerts.push(bookingFailureAlert);

    const paymentFailureAlert = await this.checkPaymentFailures(oneDayAgo);
    if (paymentFailureAlert) alerts.push(paymentFailureAlert);

    const refundAlert = await this.checkRefundVolume(oneDayAgo);
    if (refundAlert) alerts.push(refundAlert);

    const suspiciousRegistrations =
      await this.checkSuspiciousRegistrations(oneHourAgo);
    if (suspiciousRegistrations) alerts.push(suspiciousRegistrations);

    const providerSuspensions = await this.checkProviderSuspensions(oneDayAgo);
    if (providerSuspensions) alerts.push(providerSuspensions);

    const supportTicketSpike = await this.checkSupportTicketSpike(oneHourAgo);
    if (supportTicketSpike) alerts.push(supportTicketSpike);

    return alerts;
  }

  private async checkBookingFailures(
    since: Date,
  ): Promise<OperationalAlertDto | null> {
    const total = await this.bookingRepository.count({
      where: { createdAt: LessThanOrEqual(since) },
    });
    if (total === 0) return null;

    const cancelled = await this.bookingRepository.count({
      where: {
        status: BookingStatus.CANCELLED,
        createdAt: LessThanOrEqual(since),
      },
    });

    const rate = (cancelled / total) * 100;
    if (rate > this.thresholds.bookingFailureRate) {
      return {
        alertType: 'high_booking_failure',
        severity: 'warning',
        message: `Booking failure rate is ${rate.toFixed(1)}% (threshold: ${this.thresholds.bookingFailureRate}%)`,
        relatedEntity: 'booking',
        timestamp: new Date(),
      };
    }
    return null;
  }

  private async checkPaymentFailures(
    since: Date,
  ): Promise<OperationalAlertDto | null> {
    const count = await this.paymentRepository.count({
      where: {
        paymentStatus: PaymentStatus.FAILED,
        createdAt: LessThanOrEqual(since),
      },
    });

    if (count > this.thresholds.paymentFailureCount) {
      return {
        alertType: 'high_payment_failures',
        severity: 'critical',
        message: `${count} payment failures in the last 24 hours (threshold: ${this.thresholds.paymentFailureCount})`,
        relatedEntity: 'payment',
        timestamp: new Date(),
      };
    }
    return null;
  }

  private async checkRefundVolume(
    since: Date,
  ): Promise<OperationalAlertDto | null> {
    const result = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(CAST(payment.amount AS float)), 0)', 'total')
      .where('payment.paymentStatus = :status', {
        status: PaymentStatus.REFUNDED,
      })
      .andWhere('payment.createdAt >= :since', { since })
      .getRawOne<{ total: number }>();

    const volume = Number(result?.total || 0);
    if (volume > this.thresholds.refundVolume) {
      return {
        alertType: 'large_refund_volume',
        severity: 'warning',
        message: `Refund volume of $${volume.toFixed(2)} exceeds threshold of $${this.thresholds.refundVolume}`,
        relatedEntity: 'refund',
        timestamp: new Date(),
      };
    }
    return null;
  }

  private async checkSuspiciousRegistrations(
    since: Date,
  ): Promise<OperationalAlertDto | null> {
    const count = await this.userRepository.count({
      where: { createdAt: LessThanOrEqual(since) },
    });

    if (count > this.thresholds.suspiciousRegistrationRate) {
      return {
        alertType: 'suspicious_registrations',
        severity: 'warning',
        message: `${count} new user registrations in the last hour (threshold: ${this.thresholds.suspiciousRegistrationRate})`,
        relatedEntity: 'user',
        timestamp: new Date(),
      };
    }
    return null;
  }

  private async checkProviderSuspensions(
    since: Date,
  ): Promise<OperationalAlertDto | null> {
    const count = await this.userRepository.count({
      where: {
        role: UserRole.PROVIDER,
        status: UserStatus.SUSPENDED,
        updatedAt: LessThanOrEqual(since),
      },
    });

    if (count > this.thresholds.providerSuspensionCount) {
      return {
        alertType: 'provider_suspensions',
        severity: 'critical',
        message: `${count} providers suspended in the last 24 hours (threshold: ${this.thresholds.providerSuspensionCount})`,
        relatedEntity: 'provider',
        timestamp: new Date(),
      };
    }
    return null;
  }

  private async checkSupportTicketSpike(
    since: Date,
  ): Promise<OperationalAlertDto | null> {
    const count = await this.supportTicketRepository.count({
      where: { createdAt: LessThanOrEqual(since) },
    });

    if (count > this.thresholds.supportTicketSpike) {
      return {
        alertType: 'support_ticket_spike',
        severity: 'warning',
        message: `${count} support tickets created in the last hour (threshold: ${this.thresholds.supportTicketSpike})`,
        relatedEntity: 'support_ticket',
        timestamp: new Date(),
      };
    }
    return null;
  }
}
