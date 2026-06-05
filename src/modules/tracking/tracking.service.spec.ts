import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Repository } from 'typeorm';
import { TrackingService } from './tracking.service';
import { TrackingSession } from '../../entities/tracking-session.entity';
import { TrackingLocation } from '../../entities/tracking-location.entity';
import { TrackingAuditEvent } from '../../entities/tracking-audit-event.entity';
import { Booking, BookingStatus } from '../../entities/booking.entity';
import { TrackingSessionStatus } from './enums/tracking-session-status.enum';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

describe('TrackingService', () => {
  let service: TrackingService;
  let sessionRepo: Repository<TrackingSession>;
  let locationRepo: Repository<TrackingLocation>;
  let bookingRepo: Repository<Booking>;
  let eventEmitter: EventEmitter2;

  const mockBooking = {
    id: 'booking-1',
    customerId: 'customer-1',
    providerId: 'provider-1',
    status: BookingStatus.ACCEPTED,
  } as Booking;

  const mockSession = {
    id: 'session-1',
    bookingId: 'booking-1',
    providerId: 'provider-1',
    customerId: 'customer-1',
    status: TrackingSessionStatus.ACTIVE,
    startedAt: new Date(),
    endedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as TrackingSession;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrackingService,
        {
          provide: getRepositoryToken(TrackingSession),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TrackingLocation),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(TrackingAuditEvent),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Booking),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TrackingService>(TrackingService);
    sessionRepo = module.get(getRepositoryToken(TrackingSession));
    locationRepo = module.get(getRepositoryToken(TrackingLocation));
    bookingRepo = module.get(getRepositoryToken(Booking));
    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('startSession', () => {
    it('should start a session for an accepted booking', async () => {
      jest.spyOn(bookingRepo, 'findOne').mockResolvedValue(mockBooking as any);
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(null);
      jest.spyOn(sessionRepo, 'create').mockReturnValue(mockSession as any);
      jest.spyOn(sessionRepo, 'save').mockResolvedValue(mockSession as any);

      const result = await service.startSession('booking-1', 'provider-1');

      expect(result).toBeDefined();
      expect(result.status).toBe(TrackingSessionStatus.ACTIVE);
      expect(eventEmitter.emit).toHaveBeenCalledWith('tracking.started', expect.any(Object));
    });

    it('should throw when booking not found', async () => {
      jest.spyOn(bookingRepo, 'findOne').mockResolvedValue(null);

      await expect(service.startSession('invalid', 'provider-1')).rejects.toThrow(NotFoundException);
    });

    it('should throw when booking belongs to another provider', async () => {
      jest.spyOn(bookingRepo, 'findOne').mockResolvedValue(mockBooking as any);

      await expect(service.startSession('booking-1', 'wrong-provider')).rejects.toThrow(ForbiddenException);
    });

    it('should throw when booking status does not allow tracking', async () => {
      const pendingBooking = { ...mockBooking, status: BookingStatus.PENDING };
      jest.spyOn(bookingRepo, 'findOne').mockResolvedValue(pendingBooking as any);

      await expect(service.startSession('booking-1', 'provider-1')).rejects.toThrow(BadRequestException);
    });

    it('should throw when active session already exists', async () => {
      jest.spyOn(bookingRepo, 'findOne').mockResolvedValue(mockBooking as any);
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(mockSession as any);

      await expect(service.startSession('booking-1', 'provider-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateLocation', () => {
    it('should update location for active session', async () => {
      const dto = { latitude: 30.0444, longitude: 31.2357, speed: 12.5, heading: 45 };
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(mockSession as any);
      jest.spyOn(locationRepo, 'create').mockReturnValue({ id: 'loc-1', ...dto } as any);
      jest.spyOn(locationRepo, 'save').mockResolvedValue({ id: 'loc-1', ...dto } as any);

      const result = await service.updateLocation('session-1', dto);

      expect(result).toBeDefined();
      expect(result.id).toBe('loc-1');
    });

    it('should throw when session not found', async () => {
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(null);

      await expect(service.updateLocation('invalid', {} as any)).rejects.toThrow(NotFoundException);
    });

    it('should throw when session is not active', async () => {
      const pausedSession = { ...mockSession, status: TrackingSessionStatus.PAUSED };
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(pausedSession as any);

      await expect(service.updateLocation('session-1', {} as any)).rejects.toThrow(BadRequestException);
    });
  });

  describe('pauseSession', () => {
    it('should pause an active session', async () => {
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(mockSession as any);
      jest.spyOn(sessionRepo, 'save').mockResolvedValue({ ...mockSession, status: TrackingSessionStatus.PAUSED } as any);

      const result = await service.pauseSession('session-1');

      expect(result.status).toBe(TrackingSessionStatus.PAUSED);
      expect(eventEmitter.emit).toHaveBeenCalledWith('tracking.paused', expect.any(Object));
    });

    it('should throw when session not active', async () => {
      const pausedSession = { ...mockSession, status: TrackingSessionStatus.PAUSED };
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(pausedSession as any);

      await expect(service.pauseSession('session-1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('resumeSession', () => {
    it('should resume a paused session', async () => {
      const pausedSession = { ...mockSession, status: TrackingSessionStatus.PAUSED };
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(pausedSession as any);
      jest.spyOn(sessionRepo, 'save').mockResolvedValue(mockSession as any);

      const result = await service.resumeSession('session-1');

      expect(result.status).toBe(TrackingSessionStatus.ACTIVE);
      expect(eventEmitter.emit).toHaveBeenCalledWith('tracking.resumed', expect.any(Object));
    });
  });

  describe('completeSession', () => {
    it('should complete a session', async () => {
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(mockSession as any);
      jest.spyOn(sessionRepo, 'save').mockResolvedValue({ ...mockSession, status: TrackingSessionStatus.COMPLETED, endedAt: new Date() } as any);

      const result = await service.completeSession('session-1');

      expect(result.status).toBe(TrackingSessionStatus.COMPLETED);
      expect(result.endedAt).toBeDefined();
      expect(eventEmitter.emit).toHaveBeenCalledWith('tracking.completed', expect.any(Object));
    });
  });

  describe('getSession', () => {
    it('should return session for owning customer', async () => {
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(mockSession as any);
      jest.spyOn(locationRepo, 'findOne').mockResolvedValue(null);

      const result = await service.getSession('booking-1', 'customer-1');

      expect(result).toBeDefined();
      expect(result.sessionId).toBe('session-1');
    });

    it('should throw for non-owning customer', async () => {
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(mockSession as any);

      await expect(service.getSession('booking-1', 'wrong-customer')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getActiveSessionByProvider', () => {
    it('should return active session for provider', async () => {
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(mockSession as any);

      const result = await service.getActiveSessionByProvider('provider-1');

      expect(result).toBeDefined();
    });
  });

  describe('getPausedSessionByProvider', () => {
    it('should return paused session for provider', async () => {
      const pausedSession = { ...mockSession, status: TrackingSessionStatus.PAUSED };
      jest.spyOn(sessionRepo, 'findOne').mockResolvedValue(pausedSession as any);

      const result = await service.getPausedSessionByProvider('provider-1');

      expect(result).toBeDefined();
    });
  });
});
