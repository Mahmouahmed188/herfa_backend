import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  BookingsController,
  ProviderBookingsController,
  AdminBookingsController,
} from '../../../src/modules/bookings/bookings.controller';
import { BookingsService } from '../../../src/modules/bookings/bookings.service';
import { Booking } from '../../../src/entities/booking.entity';

describe('BookingsController', () => {
  let controller: BookingsController;
  let providerController: ProviderBookingsController;
  let adminController: AdminBookingsController;

  const mockService = {
    create: jest.fn(),
    findMyBookings: jest.fn(),
    findOne: jest.fn(),
    cancel: jest.fn(),
    findProviderBookings: jest.fn(),
    accept: jest.fn(),
    reject: jest.fn(),
    markOnTheWay: jest.fn(),
    markInProgress: jest.fn(),
    markCompleted: jest.fn(),
    findAll: jest.fn(),
    adminCancel: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [
        BookingsController,
        ProviderBookingsController,
        AdminBookingsController,
      ],
      providers: [
        { provide: BookingsService, useValue: mockService },
        {
          provide: getRepositoryToken(Booking),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<BookingsController>(BookingsController);
    providerController = module.get<ProviderBookingsController>(
      ProviderBookingsController,
    );
    adminController = module.get<AdminBookingsController>(
      AdminBookingsController,
    );

    jest.clearAllMocks();
  });

  describe('BookingsController (customer)', () => {
    it('should create a booking', async () => {
      const dto = {
        serviceId: 'service-uuid',
        providerId: 'provider-uuid',
        addressLine: '123 Main St',
        city: 'Cairo',
        scheduledDate: '2026-06-15',
        scheduledTime: '10:00',
      };
      const mockResult = {
        id: 'booking-uuid',
        bookingNumber: 'BKG-TEST',
        status: 'pending',
      };
      mockService.create.mockResolvedValue(mockResult);

      const result = await controller.create(dto, 'customer-uuid');
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResult);
      expect(mockService.create).toHaveBeenCalledWith(dto, 'customer-uuid');
    });

    it('should get my bookings', async () => {
      const mockResult = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
      mockService.findMyBookings.mockResolvedValue(mockResult);

      const result = await controller.findMyBookings('customer-uuid', {
        page: 1,
        limit: 20,
      });
      expect(result.success).toBe(true);
    });

    it('should find one booking', async () => {
      const mockResult = { id: 'booking-uuid' };
      mockService.findOne.mockResolvedValue(mockResult);

      const result = await controller.findOne('booking-uuid');
      expect(result.success).toBe(true);
      expect(mockService.findOne).toHaveBeenCalledWith('booking-uuid');
    });

    it('should cancel a booking', async () => {
      const mockResult = { id: 'booking-uuid', status: 'cancelled' };
      mockService.cancel.mockResolvedValue(mockResult);

      const result = await controller.cancelCustomer(
        'booking-uuid',
        { reason: 'test' },
        'customer-uuid',
      );
      expect(result.success).toBe(true);
      expect(mockService.cancel).toHaveBeenCalledWith(
        'booking-uuid',
        'customer-uuid',
        { reason: 'test' },
      );
    });
  });

  describe('ProviderBookingsController', () => {
    it('should get provider bookings', async () => {
      const mockResult = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
      mockService.findProviderBookings.mockResolvedValue(mockResult);

      const result = await providerController.findProviderBookings(
        {
          id: 'provider-uuid',
          providerProfileId: 'prov-profile-uuid',
          role: 'provider',
        },
        { page: 1, limit: 20 },
      );
      expect(result.success).toBe(true);
    });

    it('should accept a booking', async () => {
      mockService.accept.mockResolvedValue({
        id: 'booking-uuid',
        status: 'accepted',
      });
      const result = await providerController.accept(
        'booking-uuid',
        'provider-uuid',
      );
      expect(result.success).toBe(true);
    });

    it('should reject a booking', async () => {
      mockService.reject.mockResolvedValue({
        id: 'booking-uuid',
        status: 'rejected',
      });
      const result = await providerController.reject(
        'booking-uuid',
        { reason: 'Not available' },
        'provider-uuid',
      );
      expect(result.success).toBe(true);
    });

    it('should mark on the way', async () => {
      mockService.markOnTheWay.mockResolvedValue({
        id: 'booking-uuid',
        status: 'on_the_way',
      });
      const result = await providerController.markOnTheWay(
        'booking-uuid',
        'provider-uuid',
      );
      expect(result.success).toBe(true);
    });

    it('should mark in progress', async () => {
      mockService.markInProgress.mockResolvedValue({
        id: 'booking-uuid',
        status: 'in_progress',
      });
      const result = await providerController.markInProgress(
        'booking-uuid',
        'provider-uuid',
      );
      expect(result.success).toBe(true);
    });

    it('should mark completed', async () => {
      mockService.markCompleted.mockResolvedValue({
        id: 'booking-uuid',
        status: 'completed',
        completedAt: new Date(),
      });
      const result = await providerController.markCompleted(
        'booking-uuid',
        'provider-uuid',
      );
      expect(result.success).toBe(true);
    });
  });

  describe('AdminBookingsController', () => {
    it('should get all bookings', async () => {
      const mockResult = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
      mockService.findAll.mockResolvedValue(mockResult);

      const result = await adminController.findAll({ page: 1, limit: 20 });
      expect(result.success).toBe(true);
    });

    it('should find a booking', async () => {
      mockService.findOne.mockResolvedValue({ id: 'booking-uuid' });
      const result = await adminController.findOne('booking-uuid');
      expect(result.success).toBe(true);
    });

    it('should cancel a booking with reason', async () => {
      mockService.adminCancel.mockResolvedValue({
        id: 'booking-uuid',
        status: 'cancelled',
      });
      const result = await adminController.adminCancel(
        'booking-uuid',
        'Admin intervention',
        'admin-uuid',
      );
      expect(result.success).toBe(true);
      expect(mockService.adminCancel).toHaveBeenCalledWith(
        'booking-uuid',
        'admin-uuid',
        'Admin intervention',
      );
    });

    it('should return error when cancelling without reason', async () => {
      const result = await adminController.adminCancel(
        'booking-uuid',
        '',
        'admin-uuid',
      );
      expect(result.success).toBe(false);
      expect(result.errorCode).toBe('VALIDATION_ERROR');
    });
  });
});
