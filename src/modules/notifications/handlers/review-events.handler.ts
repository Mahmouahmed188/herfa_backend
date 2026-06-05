import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class ReviewEventsHandler {
  private readonly logger = new Logger(ReviewEventsHandler.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('review.created')
  async handleReviewCreated(payload: any) {
    const data = payload.data || payload;

    const revieweeId = data.revieweeId || data.providerId;

    await this.notificationsService.create({
      userId: revieweeId,
      type: 'review_received' as any,
      title: 'New Review Submitted',
      message: 'You have received a new review.',
      relatedEntityType: 'Review',
      relatedEntityId: data.reviewId,
    });

    this.logger.log(`Review notification sent to user ${revieweeId}`);
  }
}
