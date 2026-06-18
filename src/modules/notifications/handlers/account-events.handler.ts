import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class AccountEventsHandler {
  private readonly logger = new Logger(AccountEventsHandler.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('account.verified')
  async handleAccountVerified(payload: any) {
    const data = payload.data || payload;

    await this.notificationsService.create({
      userId: data.userId,
      type: 'account_verified' as any,
      title: 'Account Verified',
      message: 'Your account has been successfully verified.',
      relatedEntityType: 'Account',
      relatedEntityId: data.userId,
    });

    this.logger.log(
      `Account verified notification sent to user ${data.userId}`,
    );
  }

  @OnEvent('account.suspended')
  async handleAccountSuspended(payload: any) {
    const data = payload.data || payload;

    await this.notificationsService.create({
      userId: data.userId,
      type: 'account_suspended' as any,
      title: 'Account Suspended',
      message: data.reason
        ? `Your account has been suspended: ${data.reason}`
        : 'Your account has been suspended.',
      relatedEntityType: 'Account',
      relatedEntityId: data.userId,
    });

    this.logger.log(
      `Account suspended notification sent to user ${data.userId}`,
    );
  }
}
