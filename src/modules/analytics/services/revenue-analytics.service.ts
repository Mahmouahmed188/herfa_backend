import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from '../../../entities/payment.entity';
import { Refund } from '../../../entities/refund.entity';
import { PaymentStatus } from '../../../common/constants/user.enums';
import { DateRangeFilterService } from './date-range-filter.service';
import { DateRangePreset } from '../dto/date-range-filter.dto';
import { RevenueAnalyticsDto } from '../dto/revenue-analytics.dto';

@Injectable()
export class RevenueAnalyticsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    private dateRangeFilterService: DateRangeFilterService,
  ) {}

  async getAnalytics(
    preset?: DateRangePreset,
    startDate?: string,
    endDate?: string,
  ): Promise<RevenueAnalyticsDto> {
    const range = this.dateRangeFilterService.resolve(preset, startDate, endDate);

    const totalRevenueResult = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'total')
      .where('payment.paymentStatus = :status', { status: PaymentStatus.PAID })
      .andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .getRawOne<{ total: string }>();

    const dailyRevenue = await this.paymentRepository
      .createQueryBuilder('payment')
      .select("TO_CHAR(payment.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'amount')
      .where('payment.paymentStatus = :status', { status: PaymentStatus.PAID })
      .andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy("TO_CHAR(payment.createdAt, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; amount: string }>();

    const weeklyRevenue = await this.paymentRepository
      .createQueryBuilder('payment')
      .select("TO_CHAR(payment.createdAt, 'IYYY-\"W\"IW')", 'week')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'amount')
      .where('payment.paymentStatus = :status', { status: PaymentStatus.PAID })
      .andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy("TO_CHAR(payment.createdAt, 'IYYY-\"W\"IW')")
      .orderBy('week', 'ASC')
      .getRawMany<{ week: string; amount: string }>();

    const monthlyRevenue = await this.paymentRepository
      .createQueryBuilder('payment')
      .select("TO_CHAR(payment.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'amount')
      .where('payment.paymentStatus = :status', { status: PaymentStatus.PAID })
      .andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy("TO_CHAR(payment.createdAt, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; amount: string }>();

    const revenueByCategory = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COALESCE(category.name, \'Unknown\')', 'category')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'amount')
      .leftJoin('payment.booking', 'booking')
      .leftJoin('booking.service', 'service')
      .leftJoin('service.category', 'category')
      .where('payment.paymentStatus = :status', { status: PaymentStatus.PAID })
      .andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy('category.name')
      .orderBy('amount', 'DESC')
      .getRawMany<{ category: string; amount: string }>();

    const revenueByProvider = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('payment.providerId', 'providerId')
      .addSelect('COALESCE(provider.businessName, \'Unknown\')', 'businessName')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'amount')
      .leftJoin('payment.provider', 'providerUser')
      .leftJoin('providerUser.providerProfile', 'provider')
      .where('payment.paymentStatus = :status', { status: PaymentStatus.PAID })
      .andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy('payment.providerId')
      .addGroupBy('provider.businessName')
      .orderBy('amount', 'DESC')
      .getRawMany<{ providerId: string; businessName: string; amount: string }>();

    const refundStats = await this.refundRepository
      .createQueryBuilder('refund')
      .select('COALESCE(SUM(refund.refundAmount), 0)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('refund.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .getRawOne<{ total: string; count: string }>();

    const failedPaymentStats = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'volume')
      .where('payment.paymentStatus = :status', { status: PaymentStatus.FAILED })
      .andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .getRawOne<{ count: string; volume: string }>();

    return {
      totalRevenue: Number(totalRevenueResult?.total || 0),
      dailyRevenue: dailyRevenue.map((r) => ({ date: r.date, amount: Number(r.amount) })),
      weeklyRevenue: weeklyRevenue.map((r) => ({ date: r.week, amount: Number(r.amount) })),
      monthlyRevenue: monthlyRevenue.map((r) => ({ date: r.month, amount: Number(r.amount) })),
      revenueByCategory: revenueByCategory.map((r) => ({ category: r.category, amount: Number(r.amount) })),
      revenueByProvider: revenueByProvider.map((r) => ({
        providerId: r.providerId,
        businessName: r.businessName,
        amount: Number(r.amount),
      })),
      totalRefunds: Number(refundStats?.total || 0),
      refundCount: Number(refundStats?.count || 0),
      failedPaymentCount: Number(failedPaymentStats?.count || 0),
      failedPaymentVolume: Number(failedPaymentStats?.volume || 0),
    };
  }
}
