import { Test, TestingModule } from '@nestjs/testing';
import { ReviewEventsHandler } from './review-events.handler';
import { NotificationsService } from '../notifications.service';

describe('ReviewEventsHandler', () => {
  let handler: ReviewEventsHandler;

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({ id: 'notif-uuid' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewEventsHandler,
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    handler = module.get<ReviewEventsHandler>(ReviewEventsHandler);
    jest.clearAllMocks();
  });

  it('should handle review.created', async () => {
    const payload = {
      event: 'review.created',
      data: {
        reviewId: 'review-uuid',
        revieweeId: 'provider-uuid',
        rating: 5,
      },
    };

    await handler.handleReviewCreated(payload);

    expect(mockNotificationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'provider-uuid',
        type: 'review_received',
        title: 'New Review Submitted',
        relatedEntityId: 'review-uuid',
      }),
    );
  });
});
