import { Test, TestingModule } from '@nestjs/testing';
import { BookingEventsHandler } from './booking-events.handler';
import { NotificationsService } from '../notifications.service';

describe('BookingEventsHandler', () => {
  let handler: BookingEventsHandler;

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({ id: 'notif-uuid' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingEventsHandler,
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    handler = module.get<BookingEventsHandler>(BookingEventsHandler);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  const eventPayload = {
    event: 'booking.accepted',
    timestamp: '2026-06-05T10:00:00.000Z',
    data: {
      bookingId: 'booking-uuid',
      customerId: 'customer-uuid',
      providerId: 'provider-uuid',
    },
  };

  it('should handle booking.created', async () => {
    await handler.handleBookingCreated(eventPayload);
    expect(mockNotificationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'customer-uuid',
        type: 'booking_created',
        relatedEntityId: 'booking-uuid',
      }),
    );
  });

  it('should handle booking.accepted', async () => {
    await handler.handleBookingAccepted(eventPayload);
    expect(mockNotificationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'customer-uuid',
        title: 'Booking Accepted',
      }),
    );
  });

  it('should handle booking.cancelled for both customer and provider', async () => {
    await handler.handleBookingCancelled(eventPayload);
    expect(mockNotificationsService.create).toHaveBeenCalledTimes(2);
  });
});
