import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { Address } from '../../../entities/address.entity';
import { ProviderProfile } from '../../../entities/provider-profile.entity';
import { Booking } from '../../../entities/booking.entity';
import { Payment } from '../../../entities/payment.entity';
import { UserRole, PaymentStatus } from '../../../common/constants/user.enums';
import { DateRangeFilterService } from './date-range-filter.service';
import { DateRangePreset } from '../dto/date-range-filter.dto';
import { GeographicAnalyticsDto } from '../dto/geographic-analytics.dto';

@Injectable()
export class GeographicAnalyticsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    @InjectRepository(ProviderProfile)
    private providerProfileRepository: Repository<ProviderProfile>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    private dateRangeFilterService: DateRangeFilterService,
  ) {}

  async getAnalytics(
    preset?: DateRangePreset,
    startDate?: string,
    endDate?: string,
  ): Promise<GeographicAnalyticsDto> {
    const range = this.dateRangeFilterService.resolve(preset, startDate, endDate);

    const usersByCity = await this.addressRepository
      .createQueryBuilder('address')
      .select('address.city', 'city')
      .addSelect('COUNT(DISTINCT address.userId)', 'count')
      .where('address.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy('address.city')
      .having('COUNT(DISTINCT address.userId) > 0')
      .orderBy('count', 'DESC')
      .getRawMany<{ city: string; count: string }>();

    const providersByCity = await this.providerProfileRepository
      .createQueryBuilder('profile')
      .select("COALESCE(NULLIF(profile.address, ''), 'Unknown')", 'city')
      .addSelect('COUNT(DISTINCT profile.userId)', 'count')
      .where('profile.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy('profile.address')
      .having('COUNT(DISTINCT profile.userId) > 0')
      .orderBy('count', 'DESC')
      .getRawMany<{ city: string; count: string }>();

    const bookingsByCity = await this.bookingRepository
      .createQueryBuilder('booking')
      .select("COALESCE(NULLIF(booking.city, ''), 'Unknown')", 'city')
      .addSelect('COUNT(*)', 'count')
      .where('booking.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy('booking.city')
      .having('COUNT(*) > 0')
      .orderBy('count', 'DESC')
      .getRawMany<{ city: string; count: string }>();

    const revenueByCity = await this.paymentRepository
      .createQueryBuilder('payment')
      .select("COALESCE(NULLIF(booking.city, ''), 'Unknown')", 'city')
      .addSelect('COALESCE(SUM(payment.amount), 0)', 'revenue')
      .leftJoin('payment.booking', 'booking')
      .where('payment.paymentStatus = :status', { status: PaymentStatus.PAID })
      .andWhere('payment.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .groupBy('booking.city')
      .having('SUM(payment.amount) > 0')
      .orderBy('revenue', 'DESC')
      .getRawMany<{ city: string; revenue: string }>();

    return {
      usersByCity: usersByCity.map((c) => ({ city: c.city, count: parseInt(c.count) })),
      providersByCity: providersByCity.map((c) => ({ city: c.city, count: parseInt(c.count) })),
      bookingsByCity: bookingsByCity.map((c) => ({ city: c.city, count: parseInt(c.count) })),
      revenueByCity: revenueByCity.map((c) => ({ city: c.city, revenue: Number(c.revenue) })),
    };
  }
}
