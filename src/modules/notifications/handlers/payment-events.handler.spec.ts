import { Test, TestingModule } from '@nestjs/testing';
import { PaymentEventsHandler } from './payment-events.handler';
import { NotificationsService } from '../notifications.service';

describe('PaymentEventsHandler', () => {
  let handler: PaymentEventsHandler;

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({ id: 'notif-uuid' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentEventsHandler,
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    handler = module.get<PaymentEventsHandler>(PaymentEventsHandler);
    jest.clearAllMocks();
  });

  it('should handle payment.received', async () => {
    const payload = {
      event: 'payment.received',
      data: {
        paymentId: 'payment-uuid',
        customerId: 'customer-uuid',
        providerId: 'provider-uuid',
        amount: 100,
      },
    };

    await handler.handlePaymentReceived(payload);

    expect(mockNotificationsService.create).toHaveBeenCalledTimes(2);
  });

  it('should handle payment.failed', async () => {
    const payload = {
      event: 'payment.failed',
      data: {
        paymentId: 'payment-uuid',
        customerId: 'customer-uuid',
      },
    };

    await handler.handlePaymentFailed(payload);

    expect(mockNotificationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'customer-uuid',
        type: 'payment_failed',
        title: 'Payment Failed',
      }),
    );
  });

  it('should handle payment.refunded', async () => {
    const payload = {
      event: 'payment.refunded',
      data: {
        paymentId: 'payment-uuid',
        customerId: 'customer-uuid',
      },
    };

    await handler.handlePaymentRefunded(payload);

    expect(mockNotificationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'customer-uuid',
        type: 'refund_processed',
        title: 'Refund Processed',
      }),
    );
  });
});
