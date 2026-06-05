import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { BookingStatusHistory } from '../../entities/booking-status-history.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { BookingFilterDto } from './dto/booking-filter.dto';
import { CancelBookingDto } from './dto/cancel-booking.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  [BookingStatus.PENDING]: [
    BookingStatus.ACCEPTED,
    BookingStatus.REJECTED,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.ACCEPTED]: [BookingStatus.ON_THE_WAY, BookingStatus.CANCELLED],
  [BookingStatus.ON_THE_WAY]: [
    BookingStatus.IN_PROGRESS,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.IN_PROGRESS]: [
    BookingStatus.COMPLETED,
    BookingStatus.CANCELLED,
  ],
  [BookingStatus.COMPLETED]: [],
  [BookingStatus.REJECTED]: [],
  [BookingStatus.CANCELLED]: [],
};

const TERMINAL_STATUSES = [
  BookingStatus.COMPLETED,
  BookingStatus.REJECTED,
  BookingStatus.CANCELLED,
];

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(BookingStatusHistory)
    private readonly historyRepository: Repository<BookingStatusHistory>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  validateTransition(currentStatus: string, newStatus: string): void {
    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed) {
      throw new BadRequestException(`Unknown current status: ${currentStatus}`);
    }
    if (currentStatus === newStatus) {
      throw new BadRequestException(
        `Booking is already in status: ${currentStatus}`,
      );
    }
    if (TERMINAL_STATUSES.includes(currentStatus as BookingStatus)) {
      throw new BadRequestException(
        `Cannot update a booking in terminal status: ${currentStatus}`,
      );
    }
    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid transition from "${currentStatus}" to "${newStatus}". Allowed transitions: ${allowed.join(', ')}`,
      );
    }
  }

  async recordHistory(
    bookingId: string,
    oldStatus: string | null,
    newStatus: string,
    changedBy: string,
  ): Promise<void> {
    const history = this.historyRepository.create({
      bookingId,
      oldStatus,
      newStatus,
      changedBy,
    });
    await this.historyRepository.insert(history);
  }

  emitBookingEvent(
    eventName: string,
    booking: Booking,
    extra: Record<string, unknown> = {},
  ): void {
    this.eventEmitter.emit(`booking.${eventName}`, {
      event: `booking.${eventName}`,
      timestamp: new Date().toISOString(),
      data: {
        bookingId: booking.id,
        bookingNumber: booking.bookingNumber,
        customerId: booking.customerId,
        providerId: booking.providerId,
        serviceId: booking.serviceId,
        status: booking.status,
        ...extra,
      },
    });
  }

  generateBookingNumber(): string {
    const suffix = uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
    return `BKG-${suffix}`;
  }

  async create(dto: CreateBookingDto, customerId: string): Promise<Booking> {
    const bookingNumber = this.generateBookingNumber();

    const booking = new Booking();
    booking.bookingNumber = bookingNumber;
    booking.customerId = customerId;
    booking.serviceId = dto.serviceId;
    booking.providerId = dto.providerId;
    booking.addressLine = dto.addressLine;
    booking.city = dto.city;
    booking.scheduledDate = dto.scheduledDate;
    booking.scheduledTime = dto.scheduledTime;
    booking.notes = dto.notes || null;
    booking.status = BookingStatus.PENDING;

    const saved = await this.bookingRepository.save(booking);

    await this.recordHistory(saved.id, null, BookingStatus.PENDING, customerId);
    this.emitBookingEvent('created', saved);

    this.logger.log(
      `Booking created: ${saved.bookingNumber} by customer ${customerId}`,
    );
    return saved;
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: [
        'customer',
        'provider',
        'provider.user',
        'service',
        'statusHistory',
      ],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return booking;
  }

  async findMyBookings(userId: string, filter: BookingFilterDto) {
    const where: FindOptionsWhere<Booking> = { customerId: userId };
    this.applyFilters(where, filter);

    const [items, total] = await this.bookingRepository.findAndCount({
      where,
      relations: ['customer', 'provider', 'provider.user', 'service'],
      order: { [filter.sortBy || 'createdAt']: filter.sortOrder || 'DESC' },
      skip: ((filter.page || 1) - 1) * (filter.limit || 20),
      take: filter.limit || 20,
    });

    return {
      items,
      total,
      page: filter.page || 1,
      limit: filter.limit || 20,
      totalPages: Math.ceil(total / (filter.limit || 20)),
    };
  }

  async findProviderBookings(providerId: string, filter: BookingFilterDto) {
    const where: FindOptionsWhere<Booking> = { providerId };
    this.applyFilters(where, filter);

    const [items, total] = await this.bookingRepository.findAndCount({
      where,
      relations: ['customer', 'provider', 'provider.user', 'service'],
      order: { [filter.sortBy || 'createdAt']: filter.sortOrder || 'DESC' },
      skip: ((filter.page || 1) - 1) * (filter.limit || 20),
      take: filter.limit || 20,
    });

    return {
      items,
      total,
      page: filter.page || 1,
      limit: filter.limit || 20,
      totalPages: Math.ceil(total / (filter.limit || 20)),
    };
  }

  async findAll(filter: BookingFilterDto) {
    const where: FindOptionsWhere<Booking> = {};
    this.applyFilters(where, filter);

    const [items, total] = await this.bookingRepository.findAndCount({
      where,
      relations: ['customer', 'provider', 'provider.user', 'service'],
      order: { [filter.sortBy || 'createdAt']: filter.sortOrder || 'DESC' },
      skip: ((filter.page || 1) - 1) * (filter.limit || 20),
      take: filter.limit || 20,
    });

    return {
      items,
      total,
      page: filter.page || 1,
      limit: filter.limit || 20,
      totalPages: Math.ceil(total / (filter.limit || 20)),
    };
  }

  private applyFilters(
    where: FindOptionsWhere<Booking>,
    filter: BookingFilterDto,
  ): void {
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.providerId) {
      where.providerId = filter.providerId;
    }
    if (filter.customerId) {
      where.customerId = filter.customerId;
    }
    if (filter.serviceId) {
      where.serviceId = filter.serviceId;
    }
    if (filter.fromDate && filter.toDate) {
      where.scheduledDate = Between(filter.fromDate, filter.toDate);
    } else if (filter.fromDate) {
      where.scheduledDate = Between(filter.fromDate, '9999-12-31');
    } else if (filter.toDate) {
      where.scheduledDate = Between('0000-01-01', filter.toDate);
    }
    if (filter.search) {
      where.bookingNumber = Like(`%${filter.search}%`);
    }
  }

  async updateStatus(
    id: string,
    newStatus: string,
    changedBy: string,
    extra?: Record<string, unknown>,
  ): Promise<Booking> {
    const booking = await this.findOne(id);
    this.validateTransition(booking.status, newStatus);

    const oldStatus = booking.status;
    booking.status = newStatus;

    const completedStatus = BookingStatus.COMPLETED as string;
    const cancelledStatus = BookingStatus.CANCELLED as string;

    if (newStatus === completedStatus) {
      booking.completedAt = new Date();
    }
    if (newStatus === cancelledStatus) {
      booking.cancelledAt = new Date();
      if (extra?.reason) {
        booking.cancellationReason = extra.reason as string;
      }
    }

    const saved = await this.bookingRepository.save(booking);
    await this.recordHistory(id, oldStatus, newStatus, changedBy);

    const eventName = newStatus.replace('_', '.');
    this.emitBookingEvent(eventName, saved, {
      ...(extra?.reason ? { reason: extra.reason } : {}),
      ...(newStatus === completedStatus
        ? { completedAt: saved.completedAt }
        : {}),
    });

    this.logger.log(
      `Booking ${saved.bookingNumber}: ${oldStatus} → ${newStatus} by ${changedBy}`,
    );
    return saved;
  }

  async cancel(
    id: string,
    userId: string,
    dto?: CancelBookingDto,
  ): Promise<Booking> {
    return this.updateStatus(id, BookingStatus.CANCELLED, userId, {
      reason: dto?.reason || null,
    });
  }

  async accept(id: string, providerId: string): Promise<Booking> {
    return this.updateStatus(id, BookingStatus.ACCEPTED, providerId);
  }

  async reject(
    id: string,
    providerId: string,
    reason?: string,
  ): Promise<Booking> {
    const booking = await this.findOne(id);
    this.validateTransition(booking.status, BookingStatus.REJECTED);
    const oldStatus = booking.status;
    booking.status = BookingStatus.REJECTED;
    const saved = await this.bookingRepository.save(booking);
    await this.recordHistory(id, oldStatus, BookingStatus.REJECTED, providerId);
    this.emitBookingEvent('rejected', saved, { reason: reason || null });
    this.logger.log(
      `Booking ${saved.bookingNumber}: rejected by provider ${providerId}`,
    );
    return saved;
  }

  async markOnTheWay(id: string, providerId: string): Promise<Booking> {
    return this.updateStatus(id, BookingStatus.ON_THE_WAY, providerId);
  }

  async markInProgress(id: string, providerId: string): Promise<Booking> {
    return this.updateStatus(id, BookingStatus.IN_PROGRESS, providerId);
  }

  async markCompleted(id: string, providerId: string): Promise<Booking> {
    return this.updateStatus(id, BookingStatus.COMPLETED, providerId);
  }

  async adminCancel(
    id: string,
    adminId: string,
    reason: string,
  ): Promise<Booking> {
    const booking = await this.findOne(id);
    if (booking.status === (BookingStatus.COMPLETED as string)) {
      this.logger.warn(
        `Admin ${adminId} cancelled completed booking ${booking.bookingNumber}`,
      );
    }
    return this.updateStatus(id, BookingStatus.CANCELLED, adminId, { reason });
  }
}
