import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Between } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TrackingSession } from '../../entities/tracking-session.entity';
import { TrackingLocation } from '../../entities/tracking-location.entity';
import { TrackingAuditEvent } from '../../entities/tracking-audit-event.entity';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { TrackingSessionStatus } from './enums/tracking-session-status.enum';
import { LocationUpdateDto } from './dto/location-update.dto';
import { TrackingFilterDto } from './dto/tracking-filter.dto';

const VALID_BOOKING_STATUSES_FOR_TRACKING = [
  BookingStatus.ACCEPTED,
  BookingStatus.ON_THE_WAY,
  BookingStatus.IN_PROGRESS,
];

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);

  constructor(
    @InjectRepository(TrackingSession)
    private readonly trackingSessionRepository: Repository<TrackingSession>,
    @InjectRepository(TrackingLocation)
    private readonly trackingLocationRepository: Repository<TrackingLocation>,
    @InjectRepository(TrackingAuditEvent)
    private readonly trackingAuditEventRepository: Repository<TrackingAuditEvent>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async startSession(bookingId: string, providerId: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id: bookingId },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (booking.providerId !== providerId) {
      throw new ForbiddenException('This booking does not belong to you');
    }

    if (!VALID_BOOKING_STATUSES_FOR_TRACKING.includes(booking.status as BookingStatus)) {
      throw new BadRequestException(
        `Cannot start tracking for booking in status "${booking.status}". Booking must be accepted, on_the_way, or in_progress.`,
      );
    }

    const existingActive = await this.trackingSessionRepository.findOne({
      where: { bookingId, status: TrackingSessionStatus.ACTIVE },
    });

    if (existingActive) {
      throw new BadRequestException('An active tracking session already exists for this booking');
    }

    const existingPaused = await this.trackingSessionRepository.findOne({
      where: { bookingId, status: TrackingSessionStatus.PAUSED },
    });

    if (existingPaused) {
      existingPaused.status = TrackingSessionStatus.ACTIVE;
      existingPaused.startedAt = new Date();
      const saved = await this.trackingSessionRepository.save(existingPaused);

      await this.createAuditEvent(
        saved.id,
        'resumed',
        TrackingSessionStatus.PAUSED,
        TrackingSessionStatus.ACTIVE,
      );

      this.eventEmitter.emit('tracking.resumed', {
        sessionId: saved.id,
        bookingId,
        providerId,
        customerId: booking.customerId,
      });

      return saved;
    }

    const session = this.trackingSessionRepository.create({
      bookingId,
      providerId,
      customerId: booking.customerId,
      status: TrackingSessionStatus.ACTIVE,
      startedAt: new Date(),
    });

    const saved = await this.trackingSessionRepository.save(session);

    await this.createAuditEvent(
      saved.id,
      'started',
      TrackingSessionStatus.INACTIVE,
      TrackingSessionStatus.ACTIVE,
    );

    this.eventEmitter.emit('tracking.started', {
      sessionId: saved.id,
      bookingId,
      providerId,
      customerId: booking.customerId,
    });

    return saved;
  }

  async updateLocation(sessionId: string, dto: LocationUpdateDto) {
    const session = await this.trackingSessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Tracking session not found');
    }

    if (session.status !== TrackingSessionStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot update location when session status is "${session.status}". Session must be active.`,
      );
    }

    const location = this.trackingLocationRepository.create({
      trackingSessionId: sessionId,
      latitude: dto.latitude,
      longitude: dto.longitude,
      speed: dto.speed,
      heading: dto.heading,
      recordedAt: new Date(),
    });

    const saved = await this.trackingLocationRepository.save(location);

    this.logger.log(`Location updated for session ${sessionId}`);

    return saved;
  }

  async pauseSession(sessionId: string) {
    const session = await this.trackingSessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Tracking session not found');
    }

    if (session.status !== TrackingSessionStatus.ACTIVE) {
      throw new BadRequestException(
        `Cannot pause session with status "${session.status}". Only active sessions can be paused.`,
      );
    }

    session.status = TrackingSessionStatus.PAUSED;
    const saved = await this.trackingSessionRepository.save(session);

    await this.createAuditEvent(
      saved.id,
      'paused',
      TrackingSessionStatus.ACTIVE,
      TrackingSessionStatus.PAUSED,
    );

    this.eventEmitter.emit('tracking.paused', {
      sessionId: saved.id,
      bookingId: saved.bookingId,
      providerId: saved.providerId,
      customerId: saved.customerId,
    });

    return saved;
  }

  async resumeSession(sessionId: string) {
    const session = await this.trackingSessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Tracking session not found');
    }

    if (session.status !== TrackingSessionStatus.PAUSED) {
      throw new BadRequestException(
        `Cannot resume session with status "${session.status}". Only paused sessions can be resumed.`,
      );
    }

    session.status = TrackingSessionStatus.ACTIVE;
    const saved = await this.trackingSessionRepository.save(session);

    await this.createAuditEvent(
      saved.id,
      'resumed',
      TrackingSessionStatus.PAUSED,
      TrackingSessionStatus.ACTIVE,
    );

    this.eventEmitter.emit('tracking.resumed', {
      sessionId: saved.id,
      bookingId: saved.bookingId,
      providerId: saved.providerId,
      customerId: saved.customerId,
    });

    return saved;
  }

  async completeSession(sessionId: string) {
    const session = await this.trackingSessionRepository.findOne({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Tracking session not found');
    }

    if (
      session.status === TrackingSessionStatus.COMPLETED ||
      session.status === TrackingSessionStatus.INACTIVE
    ) {
      throw new BadRequestException(
        `Cannot complete session with status "${session.status}".`,
      );
    }

    session.status = TrackingSessionStatus.COMPLETED;
    session.endedAt = new Date();
    const saved = await this.trackingSessionRepository.save(session);

    await this.createAuditEvent(
      saved.id,
      'completed',
      session.status,
      TrackingSessionStatus.COMPLETED,
    );

    this.eventEmitter.emit('tracking.completed', {
      sessionId: saved.id,
      bookingId: saved.bookingId,
      providerId: saved.providerId,
      customerId: saved.customerId,
    });

    return saved;
  }

  async getSession(bookingId: string, customerId: string) {
    const session = await this.trackingSessionRepository.findOne({
      where: { bookingId },
    });

    if (!session) {
      throw new NotFoundException('No tracking session found for this booking');
    }

    if (session.customerId !== customerId) {
      throw new ForbiddenException('You do not own this booking');
    }

    const latestLocation = await this.trackingLocationRepository.findOne({
      where: { trackingSessionId: session.id },
      order: { recordedAt: 'DESC' },
    });

    return {
      sessionId: session.id,
      bookingId: session.bookingId,
      providerId: session.providerId,
      status: session.status,
      currentLocation: latestLocation
        ? {
            latitude: Number(latestLocation.latitude),
            longitude: Number(latestLocation.longitude),
            updatedAt: latestLocation.recordedAt,
          }
        : null,
      startedAt: session.startedAt,
      endedAt: session.endedAt,
    };
  }

  async getHistory(
    bookingId: string,
    customerId: string,
    pagination: { page: number; limit: number },
  ) {
    const session = await this.trackingSessionRepository.findOne({
      where: { bookingId },
    });

    if (!session) {
      throw new NotFoundException('No tracking session found for this booking');
    }

    if (session.customerId !== customerId) {
      throw new ForbiddenException('You do not own this booking');
    }

    const page = pagination.page || 1;
    const limit = pagination.limit || 50;
    const skip = (page - 1) * limit;

    const [items, total] = await this.trackingLocationRepository.findAndCount({
      where: { trackingSessionId: session.id },
      order: { recordedAt: 'ASC' },
      skip,
      take: limit,
    });

    return {
      items: items.map((loc) => ({
        id: loc.id,
        latitude: Number(loc.latitude),
        longitude: Number(loc.longitude),
        speed: loc.speed ? Number(loc.speed) : undefined,
        heading: loc.heading,
        recordedAt: loc.recordedAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAdminSessions(filter: TrackingFilterDto) {
    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<TrackingSession> = {};

    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.bookingId) {
      where.bookingId = filter.bookingId;
    }
    if (filter.providerId) {
      where.providerId = filter.providerId;
    }
    if (filter.customerId) {
      where.customerId = filter.customerId;
    }
    if (filter.dateFrom || filter.dateTo) {
      where.createdAt = Between(
        filter.dateFrom ? new Date(filter.dateFrom) : new Date(0),
        filter.dateTo ? new Date(filter.dateTo) : new Date(),
      ) as any;
    }

    const sortField = filter.sortBy || 'createdAt';
    const sortOrder = filter.sortOrder === 'ASC' ? 'ASC' : 'DESC';

    const [items, total] = await this.trackingSessionRepository.findAndCount({
      where,
      order: { [sortField]: sortOrder },
      skip,
      take: limit,
    });

    return {
      items: items.map((session) => ({
        id: session.id,
        bookingId: session.bookingId,
        providerId: session.providerId,
        customerId: session.customerId,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        createdAt: session.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAdminSessionDetail(id: string) {
    const session = await this.trackingSessionRepository.findOne({
      where: { id },
    });

    if (!session) {
      throw new NotFoundException('Tracking session not found');
    }

    const [locations, locationCount] =
      await this.trackingLocationRepository.findAndCount({
        where: { trackingSessionId: id },
        order: { recordedAt: 'ASC' },
      });

    return {
      session: {
        sessionId: session.id,
        bookingId: session.bookingId,
        providerId: session.providerId,
        customerId: session.customerId,
        status: session.status,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      },
      locations: {
        items: locations.map((loc) => ({
          id: loc.id,
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude),
          speed: loc.speed ? Number(loc.speed) : undefined,
          heading: loc.heading,
          recordedAt: loc.recordedAt,
        })),
        total: locationCount,
        page: 1,
        limit: locationCount,
        totalPages: 1,
      },
    };
  }

  async getActiveSessionByProvider(providerId: string) {
    return this.trackingSessionRepository.findOne({
      where: {
        providerId,
        status: TrackingSessionStatus.ACTIVE,
      },
    });
  }

  async getPausedSessionByProvider(providerId: string) {
    return this.trackingSessionRepository.findOne({
      where: {
        providerId,
        status: TrackingSessionStatus.PAUSED,
      },
    });
  }

  private async createAuditEvent(
    trackingSessionId: string,
    eventType: string,
    previousStatus: string,
    newStatus: string,
  ) {
    const event = this.trackingAuditEventRepository.create({
      trackingSessionId,
      eventType,
      previousStatus,
      newStatus,
    });
    await this.trackingAuditEventRepository.save(event);
    this.logger.log(
      `Audit: session ${trackingSessionId} ${eventType} (${previousStatus} -> ${newStatus})`,
    );
  }
}
