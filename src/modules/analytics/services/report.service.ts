import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { User } from '../../../entities/user.entity';
import { ProviderProfile } from '../../../entities/provider-profile.entity';
import { Booking } from '../../../entities/booking.entity';
import { Payment } from '../../../entities/payment.entity';
import { ReportFilterDto } from '../dto/report-filter.dto';

type ReportType = 'users' | 'providers' | 'bookings' | 'revenue' | 'payments';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(ProviderProfile)
    private providerProfileRepository: Repository<ProviderProfile>,
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async getReport(type: ReportType, filter: ReportFilterDto) {
    switch (type) {
      case 'users':
        return this.getUserReport(filter);
      case 'providers':
        return this.getProviderReport(filter);
      case 'bookings':
        return this.getBookingReport(filter);
      case 'revenue':
      case 'payments':
        return this.getPaymentReport(filter);
      default:
        throw new NotFoundException(`Report type '${type}' not found`);
    }
  }

  async exportCSV(type: ReportType, filter: ReportFilterDto): Promise<string> {
    const { data } = await this.getReport(type, {
      ...filter,
      page: 1,
      limit: 10000,
    });
    if (!data || data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')];

    for (const row of data) {
      csvRows.push(
        headers
          .map((h) => {
            const val = row[h];
            const str = val == null ? '' : String(val);
            return str.includes(',') || str.includes('"') || str.includes('\n')
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(','),
      );
    }

    return csvRows.join('\n');
  }

  async exportXLSX(type: ReportType, filter: ReportFilterDto): Promise<Buffer> {
    const { data } = await this.getReport(type, {
      ...filter,
      page: 1,
      limit: 10000,
    });
    if (!data || data.length === 0) {
      const emptyBook = new ExcelJS.Workbook();
      const emptySheet = emptyBook.addWorksheet('Report');
      emptySheet.addRow(['No data']);
      return Buffer.from(await emptyBook.xlsx.writeBuffer());
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(
      type.charAt(0).toUpperCase() + type.slice(1),
    );

    const headers = Object.keys(data[0]);
    sheet.addRow(headers);

    for (const row of data) {
      sheet.addRow(headers.map((h) => row[h] ?? ''));
    }

    sheet.getRow(1).font = { bold: true };

    return Buffer.from(await workbook.xlsx.writeBuffer());
  }

  private async getUserReport(filter: ReportFilterDto) {
    const qb = this.userRepository.createQueryBuilder('user');

    if (filter.dateFrom && filter.dateTo) {
      qb.andWhere('user.createdAt BETWEEN :from AND :to', {
        from: new Date(filter.dateFrom),
        to: new Date(filter.dateTo),
      });
    }
    if (filter.status) {
      qb.andWhere('user.status = :status', { status: filter.status });
    }
    if (filter.role) {
      qb.andWhere('user.role = :role', { role: filter.role });
    }
    if (filter.search) {
      qb.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.email ILIKE :search)',
        {
          search: `%${filter.search}%`,
        },
      );
    }

    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'DESC';
    const page = filter.page || 1;
    const limit = filter.limit || 20;

    const [items, total] = await qb
      .orderBy(`user.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private async getProviderReport(filter: ReportFilterDto) {
    const qb = this.providerProfileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.user', 'user');

    if (filter.dateFrom && filter.dateTo) {
      qb.andWhere('profile.createdAt BETWEEN :from AND :to', {
        from: new Date(filter.dateFrom),
        to: new Date(filter.dateTo),
      });
    }
    if (filter.status) {
      qb.andWhere('user.status = :status', { status: filter.status });
    }
    if (filter.search) {
      qb.andWhere(
        '(profile.businessName ILIKE :search OR user.email ILIKE :search)',
        {
          search: `%${filter.search}%`,
        },
      );
    }
    if (filter.city) {
      qb.andWhere('profile.address ILIKE :city', { city: `%${filter.city}%` });
    }

    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'DESC';
    const page = filter.page || 1;
    const limit = filter.limit || 20;

    const [items, total] = await qb
      .orderBy(`profile.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private async getBookingReport(filter: ReportFilterDto) {
    const qb = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.customer', 'customer')
      .leftJoinAndSelect('booking.service', 'service');

    if (filter.dateFrom && filter.dateTo) {
      qb.andWhere('booking.createdAt BETWEEN :from AND :to', {
        from: new Date(filter.dateFrom),
        to: new Date(filter.dateTo),
      });
    }
    if (filter.status) {
      qb.andWhere('booking.status = :status', { status: filter.status });
    }
    if (filter.providerId) {
      qb.andWhere('booking.providerId = :providerId', {
        providerId: filter.providerId,
      });
    }
    if (filter.city) {
      qb.andWhere('booking.city ILIKE :city', { city: `%${filter.city}%` });
    }

    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'DESC';
    const page = filter.page || 1;
    const limit = filter.limit || 20;

    const [items, total] = await qb
      .orderBy(`booking.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  private async getPaymentReport(filter: ReportFilterDto) {
    const qb = this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.booking', 'booking')
      .leftJoinAndSelect('payment.customer', 'customer')
      .leftJoinAndSelect('payment.provider', 'provider');

    if (filter.dateFrom && filter.dateTo) {
      qb.andWhere('payment.createdAt BETWEEN :from AND :to', {
        from: new Date(filter.dateFrom),
        to: new Date(filter.dateTo),
      });
    }
    if (filter.status) {
      qb.andWhere('payment.paymentStatus = :status', { status: filter.status });
    }
    if (filter.providerId) {
      qb.andWhere('payment.providerId = :providerId', {
        providerId: filter.providerId,
      });
    }

    const sortBy = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder || 'DESC';
    const page = filter.page || 1;
    const limit = filter.limit || 20;

    const [items, total] = await qb
      .orderBy(`payment.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data: items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}
