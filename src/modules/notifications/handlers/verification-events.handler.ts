import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';

@Injectable()
export class VerificationEventsHandler {
  private readonly logger = new Logger(VerificationEventsHandler.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('verification.submitted')
  async handleVerificationSubmitted(payload: any) {
    const data = payload.data || payload;

    await this.notificationsService.create({
      userId: data.providerId,
      type: 'verification_submitted' as any,
      title: 'Verification Submitted',
      message:
        'Your verification documents have been submitted successfully and are now under review.',
      relatedEntityType: 'ProviderVerification',
      relatedEntityId: data.verificationId,
    });

    this.logger.log(
      `Verification submitted notification sent to provider ${data.providerId}`,
    );
  }

  @OnEvent('verification.approved')
  async handleVerificationApproved(payload: any) {
    const data = payload.data || payload;

    await this.notificationsService.create({
      userId: data.providerId,
      type: 'verification_approved' as any,
      title: 'Verification Approved',
      message:
        'Congratulations! Your account has been verified. You can now receive booking requests.',
      relatedEntityType: 'ProviderVerification',
      relatedEntityId: data.verificationId,
    });

    this.logger.log(
      `Verification approved notification sent to provider ${data.providerId}`,
    );
  }

  @OnEvent('verification.rejected')
  async handleVerificationRejected(payload: any) {
    const data = payload.data || payload;

    await this.notificationsService.create({
      userId: data.providerId,
      type: 'verification_rejected' as any,
      title: 'Verification Rejected',
      message: data.reason
        ? `Your verification has been rejected: ${data.reason}`
        : 'Your verification has been rejected. Please review and resubmit.',
      relatedEntityType: 'ProviderVerification',
      relatedEntityId: data.verificationId,
    });

    this.logger.log(
      `Verification rejected notification sent to provider ${data.providerId}`,
    );
  }

  @OnEvent('verification.suspended')
  async handleVerificationSuspended(payload: any) {
    const data = payload.data || payload;

    await this.notificationsService.create({
      userId: data.providerId,
      type: 'verification_suspended' as any,
      title: 'Account Suspended',
      message: data.reason
        ? `Your account has been suspended: ${data.reason}`
        : 'Your account has been suspended.',
      relatedEntityType: 'ProviderVerification',
      relatedEntityId: data.verificationId,
    });

    this.logger.log(
      `Verification suspended notification sent to provider ${data.providerId}`,
    );
  }

  @OnEvent('verification.reactivated')
  async handleVerificationReactivated(payload: any) {
    const data = payload.data || payload;

    await this.notificationsService.create({
      userId: data.providerId,
      type: 'verification_reactivated' as any,
      title: 'Account Reactivated',
      message:
        'Your account has been reactivated. You can now receive booking requests.',
      relatedEntityType: 'ProviderVerification',
      relatedEntityId: data.verificationId,
    });

    this.logger.log(
      `Verification reactivated notification sent to provider ${data.providerId}`,
    );
  }
}
