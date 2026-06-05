import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class PaymentEventsHandler {
  private readonly logger = new Logger(PaymentEventsHandler.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('payment.received')
  async handlePaymentReceived(payload: any) {
    const data = payload.data || payload;

    await this.notificationsService.create({
      userId: data.customerId,
      type: 'payment_received' as any,
      title: 'Payment Received',
      message: 'Your payment has been processed successfully.',
      relatedEntityType: 'Payment',
      relatedEntityId: data.paymentId,
    });

    if (data.providerId) {
      await this.notificationsService.create({
        userId: data.providerId,
        type: 'payment_received' as any,
        title: 'Payment Received',
        message: 'A payment has been received for your service.',
        relatedEntityType: 'Payment',
        relatedEntityId: data.paymentId,
      });
    }
  }

  @OnEvent('payment.failed')
  async handlePaymentFailed(payload: any) {
    const data = payload.data || payload;

    await this.notificationsService.create({
      userId: data.customerId,
      type: 'payment_failed' as any,
      title: 'Payment Failed',
      message: 'Your payment could not be processed. Please try again.',
      relatedEntityType: 'Payment',
      relatedEntityId: data.paymentId,
    });
  }

  @OnEvent('payment.refunded')
  async handlePaymentRefunded(payload: any) {
    const data = payload.data || payload;

    await this.notificationsService.create({
      userId: data.customerId,
      type: 'refund_processed' as any,
      title: 'Refund Processed',
      message: 'Your refund has been processed successfully.',
      relatedEntityType: 'Payment',
      relatedEntityId: data.paymentId,
    });
  }
}
