import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification } from '../../entities/notification.entity';
import { NotificationAnnouncement } from '../../entities/notification-announcement.entity';
import { InAppChannel } from './channels/in-app.channel';
import { BookingEventsHandler } from './handlers/booking-events.handler';
import { ReviewEventsHandler } from './handlers/review-events.handler';
import { PaymentEventsHandler } from './handlers/payment-events.handler';
import { AccountEventsHandler } from './handlers/account-events.handler';
import { VerificationEventsHandler } from './handlers/verification-events.handler';
import { SupportEventsHandler } from './handlers/support-events.handler';
import { TrackingModule } from '../tracking/tracking.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, NotificationAnnouncement]),
    TrackingModule,
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    InAppChannel,
    BookingEventsHandler,
    ReviewEventsHandler,
    PaymentEventsHandler,
    AccountEventsHandler,
    VerificationEventsHandler,
    SupportEventsHandler,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}
