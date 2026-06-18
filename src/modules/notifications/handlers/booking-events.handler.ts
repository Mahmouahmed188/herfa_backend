import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class BookingEventsHandler {
  private readonly logger = new Logger(BookingEventsHandler.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('booking.created')
  async handleBookingCreated(payload: any) {
    const data = payload.data || payload;
    await this.notificationsService.create({
      userId: data.customerId,
      type: 'booking_created' as any,
      title: 'Booking Created',
      message:
        'Your booking request has been created and is pending provider response.',
      relatedEntityType: 'Booking',
      relatedEntityId: data.bookingId,
    });
    this.logger.log(
      `Booking created notification sent to customer ${data.customerId}`,
    );
  }

  @OnEvent('booking.accepted')
  async handleBookingAccepted(payload: any) {
    const data = payload.data || payload;
    await this.notificationsService.create({
      userId: data.customerId,
      type: 'booking_accepted' as any,
      title: 'Booking Accepted',
      message: 'Your booking has been accepted by the provider.',
      relatedEntityType: 'Booking',
      relatedEntityId: data.bookingId,
    });
  }

  @OnEvent('booking.rejected')
  async handleBookingRejected(payload: any) {
    const data = payload.data || payload;
    await this.notificationsService.create({
      userId: data.customerId,
      type: 'booking_rejected' as any,
      title: 'Booking Rejected',
      message: 'Your booking has been rejected by the provider.',
      relatedEntityType: 'Booking',
      relatedEntityId: data.bookingId,
    });
  }

  @OnEvent('booking.on_the_way')
  async handleBookingOnTheWay(payload: any) {
    const data = payload.data || payload;
    await this.notificationsService.create({
      userId: data.customerId,
      type: 'booking_on_the_way' as any,
      title: 'Provider On The Way',
      message: 'The provider is on their way to your location.',
      relatedEntityType: 'Booking',
      relatedEntityId: data.bookingId,
    });
  }

  @OnEvent('booking.in_progress')
  async handleBookingInProgress(payload: any) {
    const data = payload.data || payload;
    await this.notificationsService.create({
      userId: data.customerId,
      type: 'booking_in_progress' as any,
      title: 'Service Started',
      message: 'The service has started.',
      relatedEntityType: 'Booking',
      relatedEntityId: data.bookingId,
    });
  }

  @OnEvent('booking.completed')
  async handleBookingCompleted(payload: any) {
    const data = payload.data || payload;
    await this.notificationsService.create({
      userId: data.customerId,
      type: 'booking_completed' as any,
      title: 'Service Completed',
      message: 'The service has been completed. Please rate your experience.',
      relatedEntityType: 'Booking',
      relatedEntityId: data.bookingId,
    });
  }

  @OnEvent('booking.cancelled')
  async handleBookingCancelled(payload: any) {
    const data = payload.data || payload;
    await this.notificationsService.create({
      userId: data.customerId,
      type: 'booking_cancelled' as any,
      title: 'Booking Cancelled',
      message: 'Your booking has been cancelled.',
      relatedEntityType: 'Booking',
      relatedEntityId: data.bookingId,
    });
    await this.notificationsService.create({
      userId: data.providerId,
      type: 'booking_cancelled' as any,
      title: 'Booking Cancelled',
      message: 'A booking has been cancelled.',
      relatedEntityType: 'Booking',
      relatedEntityId: data.bookingId,
    });
  }
}
