import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BookingsService } from '../../../src/modules/bookings/bookings.service';
import { Booking, BookingStatus } from '../../../src/entities/booking.entity';
import { BookingStatusHistory } from '../../../src/entities/booking-status-history.entity';

describe('BookingsService', () => {
  let service: BookingsService;

  const createMockBooking = (overrides = {}) => ({
    id: 'booking-uuid',
    bookingNumber: 'BKG-TEST1234',
    customerId: 'customer-uuid',
    providerId: 'provider-uuid',
    serviceId: 'service-uuid',
    addressLine: '123 Main St',
    city: 'Cairo',
    scheduledDate: '2026-06-15',
    scheduledTime: '10:00',
    status: BookingStatus.PENDING,
    notes: null,
    completedAt: null,
    cancelledAt: null,
    cancellationReason: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  const mockBookingRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockHistoryRepository = {
    create: jest.fn(),
    insert: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: getRepositoryToken(Booking),
          useValue: mockBookingRepository,
        },
        {
          provide: getRepositoryToken(BookingStatusHistory),
          useValue: mockHistoryRepository,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    jest.clearAllMocks();
  });

  describe('validateTransition', () => {
    it('should allow valid transition from pending to accepted', () => {
      expect(() =>
        service.validateTransition(
          BookingStatus.PENDING,
          BookingStatus.ACCEPTED,
        ),
      ).not.toThrow();
    });

    it('should allow valid transition from pending to cancelled', () => {
      expect(() =>
        service.validateTransition(
          BookingStatus.PENDING,
          BookingStatus.CANCELLED,
        ),
      ).not.toThrow();
    });

    it('should reject transition from completed to any status', () => {
      expect(() =>
        service.validateTransition(
          BookingStatus.COMPLETED,
          BookingStatus.PENDING,
        ),
      ).toThrow(BadRequestException);
    });

    it('should reject duplicate status transition', () => {
      expect(() =>
        service.validateTransition(
          BookingStatus.PENDING,
          BookingStatus.PENDING,
        ),
      ).toThrow(BadRequestException);
    });

    it('should reject invalid transition from pending to in_progress', () => {
      expect(() =>
        service.validateTransition(
          BookingStatus.PENDING,
          BookingStatus.IN_PROGRESS,
        ),
      ).toThrow(BadRequestException);
    });

    it('should allow admin cancellation from in_progress', () => {
      expect(() =>
        service.validateTransition(
          BookingStatus.IN_PROGRESS,
          BookingStatus.CANCELLED,
        ),
      ).not.toThrow();
    });
  });

  describe('generateBookingNumber', () => {
    it('should generate a booking number with BKG- prefix', () => {
      const number = service.generateBookingNumber();
      expect(number).toMatch(/^BKG-/);
    });
  });

  describe('create', () => {
    it('should create a booking with pending status', async () => {
      const mockBooking = createMockBooking();
      const dto = {
        serviceId: 'service-uuid',
        providerId: 'provider-uuid',
        addressLine: '123 Main St',
        city: 'Cairo',
        scheduledDate: '2026-06-15',
        scheduledTime: '10:00',
      };

      mockBookingRepository.create.mockReturnValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue(mockBooking);
      mockHistoryRepository.create.mockReturnValue({});
      mockHistoryRepository.insert.mockResolvedValue(undefined);

      const result = await service.create(dto, 'customer-uuid');
      expect(result.status).toBe(BookingStatus.PENDING);
      expect(result.bookingNumber).toMatch(/^BKG-/);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'booking.created',
        expect.any(Object),
      );
    });
  });

  describe('findOne', () => {
    it('should return a booking when found', async () => {
      const mockBooking = createMockBooking();
      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      const result = await service.findOne('booking-uuid');
      expect(result).toEqual(mockBooking);
    });

    it('should throw NotFoundException when booking not found', async () => {
      mockBookingRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('cancel (customer)', () => {
    it('should cancel a pending booking', async () => {
      const mockBooking = createMockBooking();
      const cancelledBooking = createMockBooking({
        status: BookingStatus.CANCELLED,
        cancelledAt: new Date(),
        cancellationReason: 'Changed my mind',
      });

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue(cancelledBooking);
      mockHistoryRepository.create.mockReturnValue({});
      mockHistoryRepository.insert.mockResolvedValue(undefined);

      const result = await service.cancel('booking-uuid', 'customer-uuid', {
        reason: 'Changed my mind',
      });
      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it('should throw error when cancelling completed booking', async () => {
      const completedBooking = createMockBooking({
        status: BookingStatus.COMPLETED,
      });
      mockBookingRepository.findOne.mockResolvedValue(completedBooking);

      await expect(
        service.cancel('booking-uuid', 'customer-uuid', {}),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('accept (provider)', () => {
    it('should accept a pending booking', async () => {
      const mockBooking = createMockBooking();
      const acceptedBooking = createMockBooking({
        status: BookingStatus.ACCEPTED,
      });

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue(acceptedBooking);
      mockHistoryRepository.create.mockReturnValue({});
      mockHistoryRepository.insert.mockResolvedValue(undefined);

      const result = await service.accept('booking-uuid', 'provider-uuid');
      expect(result.status).toBe(BookingStatus.ACCEPTED);
    });
  });

  describe('full lifecycle', () => {
    it('should progress through the full happy path', async () => {
      const steps = [
        { method: 'create' as const, status: BookingStatus.PENDING },
      ];

      for (const step of steps) {
        expect(step.status).toBeDefined();
      }

      let currentStatus = BookingStatus.PENDING;
      const transitions: { method: keyof BookingsService; status: string }[] = [
        { method: 'accept', status: BookingStatus.ACCEPTED },
        { method: 'markOnTheWay', status: BookingStatus.ON_THE_WAY },
        { method: 'markInProgress', status: BookingStatus.IN_PROGRESS },
        { method: 'markCompleted', status: BookingStatus.COMPLETED },
      ];

      for (const t of transitions) {
        const mockBooking = createMockBooking({ status: currentStatus });
        const updatedBooking = createMockBooking({ status: t.status });
        mockBookingRepository.findOne.mockResolvedValue(mockBooking);
        mockBookingRepository.save.mockResolvedValue(updatedBooking);
        mockHistoryRepository.create.mockReturnValue({});
        mockHistoryRepository.insert.mockResolvedValue(undefined);

        if (t.method === 'accept') {
          await service.accept('booking-uuid', 'provider-uuid');
        } else if (t.method === 'markOnTheWay') {
          await service.markOnTheWay('booking-uuid', 'provider-uuid');
        } else if (t.method === 'markInProgress') {
          await service.markInProgress('booking-uuid', 'provider-uuid');
        } else if (t.method === 'markCompleted') {
          await service.markCompleted('booking-uuid', 'provider-uuid');
        }

        currentStatus = t.status as BookingStatus;
      }

      expect(currentStatus).toBe(BookingStatus.COMPLETED);
    });
  });

  describe('adminCancel', () => {
    it('should allow admin to cancel from pending', async () => {
      const mockBooking = createMockBooking();
      const cancelledBooking = createMockBooking({
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Admin intervention',
      });

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue(cancelledBooking);
      mockHistoryRepository.create.mockReturnValue({});
      mockHistoryRepository.insert.mockResolvedValue(undefined);

      const result = await service.adminCancel(
        'booking-uuid',
        'admin-uuid',
        'Admin intervention',
      );
      expect(result.status).toBe(BookingStatus.CANCELLED);
    });

    it('should allow admin to cancel from in_progress', async () => {
      const inProgressBooking = createMockBooking({
        status: BookingStatus.IN_PROGRESS,
      });
      const cancelledBooking = createMockBooking({
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Admin force cancel',
      });

      mockBookingRepository.findOne.mockResolvedValue(inProgressBooking);
      mockBookingRepository.save.mockResolvedValue(cancelledBooking);
      mockHistoryRepository.create.mockReturnValue({});
      mockHistoryRepository.insert.mockResolvedValue(undefined);

      const result = await service.adminCancel(
        'booking-uuid',
        'admin-uuid',
        'Admin force cancel',
      );
      expect(result.status).toBe(BookingStatus.CANCELLED);
    });
  });

  describe('reject', () => {
    it('should reject a pending booking', async () => {
      const mockBooking = createMockBooking();
      const rejectedBooking = createMockBooking({
        status: BookingStatus.REJECTED,
      });

      mockBookingRepository.findOne.mockResolvedValue(mockBooking);
      mockBookingRepository.save.mockResolvedValue(rejectedBooking);
      mockHistoryRepository.create.mockReturnValue({});
      mockHistoryRepository.insert.mockResolvedValue(undefined);

      const result = await service.reject(
        'booking-uuid',
        'provider-uuid',
        'Not available',
      );
      expect(result.status).toBe(BookingStatus.REJECTED);
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'booking.rejected',
        expect.any(Object),
      );
    });
  });
});
