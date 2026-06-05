import { Test, TestingModule } from '@nestjs/testing';
import { AccountEventsHandler } from './account-events.handler';
import { NotificationsService } from '../notifications.service';

describe('AccountEventsHandler', () => {
  let handler: AccountEventsHandler;

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({ id: 'notif-uuid' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountEventsHandler,
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    handler = module.get<AccountEventsHandler>(AccountEventsHandler);
    jest.clearAllMocks();
  });

  it('should handle account.verified', async () => {
    const payload = {
      event: 'account.verified',
      data: {
        userId: 'user-uuid',
      },
    };

    await handler.handleAccountVerified(payload);

    expect(mockNotificationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-uuid',
        type: 'account_verified',
        title: 'Account Verified',
        relatedEntityId: 'user-uuid',
      }),
    );
  });

  it('should handle account.suspended', async () => {
    const payload = {
      event: 'account.suspended',
      data: {
        userId: 'user-uuid',
        reason: 'Violation of terms',
      },
    };

    await handler.handleAccountSuspended(payload);

    expect(mockNotificationsService.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-uuid',
        type: 'account_suspended',
        title: 'Account Suspended',
        message: expect.stringContaining('Violation of terms'),
      }),
    );
  });
});
