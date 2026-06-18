import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../../entities/notification.entity';
import {
  NotificationChannel,
  NotificationPayload,
  UserContext,
} from './notification-channel.interface';
import { NotificationsGateway } from '../../tracking/notifications.gateway';

@Injectable()
export class InAppChannel implements NotificationChannel {
  readonly name = 'in-app';

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async send(
    notification: NotificationPayload,
    _user: UserContext,
  ): Promise<void> {
    const entity = this.notificationRepository.create({
      id: notification.id,
      userId: notification.userId,
      type: notification.type as any,
      title: notification.title,
      message: notification.message,
      relatedEntityType: notification.relatedEntityType,
      relatedEntityId: notification.relatedEntityId,
      actionUrl: notification.actionUrl,
      data: notification.data as Record<string, any>,
    });

    const saved = await this.notificationRepository.save(entity);

    this.notificationsGateway.sendNotification(notification.userId, saved);
  }
}
