import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from '../../../entities/booking.entity';
import { DateRangeFilterService } from './date-range-filter.service';
import { DateRangePreset } from '../dto/date-range-filter.dto';
import { BookingAnalyticsDto } from '../dto/booking-analytics.dto';

@Injectable()
export class BookingAnalyticsService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    private dateRangeFilterService: DateRangeFilterService,
  ) {}

  async getAnalytics(
    preset?: DateRangePreset,
    startDate?: string,
    endDate?: string,
  ): Promise<BookingAnalyticsDto> {
    const range = this.dateRangeFilterService.resolve(
      preset,
      startDate,
      endDate,
    );

    const totalBookings = await this.bookingRepository.count({
      where: {
        createdAt: { $between: [range.startDate, range.endDate] } as any,
      },
    });

    const dailyBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .select("TO_CHAR(booking.createdAt, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('booking.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy("TO_CHAR(booking.createdAt, 'YYYY-MM-DD')")
      .orderBy('date', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    const weeklyBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('TO_CHAR(booking.createdAt, \'IYYY-"W"IW\')', 'week')
      .addSelect('COUNT(*)', 'count')
      .where('booking.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy('TO_CHAR(booking.createdAt, \'IYYY-"W"IW\')')
      .orderBy('week', 'ASC')
      .getRawMany<{ week: string; count: string }>();

    const monthlyBookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .select("TO_CHAR(booking.createdAt, 'YYYY-MM')", 'month')
      .addSelect('COUNT(*)', 'count')
      .where('booking.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy("TO_CHAR(booking.createdAt, 'YYYY-MM')")
      .orderBy('month', 'ASC')
      .getRawMany<{ month: string; count: string }>();

    const statusDistributionRaw = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('booking.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy('booking.status')
      .getRawMany<{ status: string; count: string }>();

    const totalForStatus = statusDistributionRaw.reduce(
      (sum, row) => sum + parseInt(row.count),
      0,
    );

    const statusDistribution: Record<string, number> = {};
    for (const row of statusDistributionRaw) {
      statusDistribution[row.status] =
        totalForStatus > 0
          ? Number(((parseInt(row.count) / totalForStatus) * 100).toFixed(1))
          : 0;
    }

    const conversionResult = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('COUNT(*)', 'total')
      .addSelect(
        "COUNT(CASE WHEN booking.status = 'completed' THEN 1 END)",
        'completed',
      )
      .where('booking.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .getRawOne<{ total: string; completed: string }>();

    const conversionRate =
      conversionResult && parseInt(conversionResult.total) > 0
        ? Number(
            (
              (parseInt(conversionResult.completed) /
                parseInt(conversionResult.total)) *
              100
            ).toFixed(1),
          )
        : 0;

    const avgValueResult = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('AVG(CAST(COALESCE(payment.amount, 0) AS float))', 'average')
      .leftJoin('booking.payments', 'payment')
      .where('booking.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .getRawOne<{ average: string }>();

    return {
      totalBookings,
      dailyBookings: dailyBookings.map((d) => ({
        date: d.date,
        count: parseInt(d.count),
      })),
      weeklyBookings: weeklyBookings.map((w) => ({
        date: w.week,
        count: parseInt(w.count),
      })),
      monthlyBookings: monthlyBookings.map((m) => ({
        date: m.month,
        count: parseInt(m.count),
      })),
      statusDistribution: {
        pending: statusDistribution['pending'] || 0,
        accepted: statusDistribution['accepted'] || 0,
        in_progress: statusDistribution['in_progress'] || 0,
        completed: statusDistribution['completed'] || 0,
        cancelled: statusDistribution['cancelled'] || 0,
      },
      conversionRate,
      averageBookingValue: Number(avgValueResult?.average || 0),
    };
  }
}
