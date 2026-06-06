import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { ProviderProfile } from '../../../entities/provider-profile.entity';
import { Booking } from '../../../entities/booking.entity';
import { Payment } from '../../../entities/payment.entity';
import { SupportTicket } from '../../../entities/support-ticket.entity';
import { Dispute } from '../../../entities/dispute.entity';
import { TicketStatus } from '../../../modules/support/enums/ticket-status.enum';
import { DisputeStatus } from '../../../modules/support/enums/dispute-status.enum';
import { UserRole, PaymentStatus } from '../../../common/constants/user.enums';
import { DateRangeFilterService, DateRange } from './date-range-filter.service';
import { DashboardOverviewDto } from '../dto/dashboard-overview.dto';
import { DateRangePreset } from '../dto/date-range-filter.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProviderProfile)
    private providerProfileRepository: Repository<ProviderProfile>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(SupportTicket)
    private supportTicketRepository: Repository<SupportTicket>,
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    private dateRangeFilterService: DateRangeFilterService,
  ) {}

  async getOverview(
    preset?: DateRangePreset,
    startDate?: string,
    endDate?: string,
  ): Promise<DashboardOverviewDto> {
    const range = this.dateRangeFilterService.resolve(preset, startDate, endDate);

    const totalUsers = await this.userRepository.count();
    const totalCustomers = await this.userRepository.count({ where: { role: UserRole.CUSTOMER } });
    const totalProviders = await this.userRepository.count({ where: { role: UserRole.PROVIDER } });

    const verifiedProviders = await this.providerProfileRepository.count({
      where: { verificationStatus: 'verified' },
    });
    const activeProviders = await this.providerProfileRepository.count({
      where: { isAvailable: true },
    });

    const bookingWhere = this.withDateRange(range, this.bookingRepository.metadata.tablePath);
    const totalBookings = await this.bookingRepository.count({ where: bookingWhere });
    const activeBookings = await this.bookingRepository.count({
      where: { ...bookingWhere, status: 'in_progress' },
    });
    const completedBookings = await this.bookingRepository.count({
      where: { ...bookingWhere, status: 'completed' },
    });
    const cancelledBookings = await this.bookingRepository.count({
      where: { ...bookingWhere, status: 'cancelled' },
    });

    const revenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.paymentStatus = :status', { status: PaymentStatus.PAID })
      .andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .getRawOne<{ total: number }>();

    const pendingPayments = await this.paymentRepository.count({
      where: {
        paymentStatus: PaymentStatus.PENDING,
        createdAt: Between(range.startDate, range.endDate),
      },
    });

    const openSupportTickets = await this.supportTicketRepository.count({
      where: { status: TicketStatus.OPEN },
    });

    const activeDisputes = await this.disputeRepository.count({
      where: { status: DisputeStatus.OPEN },
    });

    return {
      totalUsers,
      totalCustomers,
      totalProviders,
      verifiedProviders,
      activeProviders,
      totalBookings,
      activeBookings,
      completedBookings,
      cancelledBookings,
      totalRevenue: Number(revenueResult?.total || 0),
      pendingPayments,
      openSupportTickets,
      activeDisputes,
      period: {
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
      },
    };
  }

  private withDateRange(range: DateRange, _tablePath: string): Record<string, any> {
    return {
      createdAt: Between(range.startDate, range.endDate),
    };
  }
}
