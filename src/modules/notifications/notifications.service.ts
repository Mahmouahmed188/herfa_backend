import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, MoreThan } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import {
  CreateNotificationDto,
  NotificationQueryDto,
} from './dto/notifications.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InAppChannel } from './channels/in-app.channel';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private eventEmitter: EventEmitter2,
    private inAppChannel: InAppChannel,
  ) {}

  async create(dto: CreateNotificationDto) {
    if (dto.relatedEntityId) {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const existing = await this.notificationRepository.findOne({
        where: {
          userId: dto.userId,
          type: dto.type,
          relatedEntityId: dto.relatedEntityId,
          createdAt: MoreThan(fiveMinutesAgo),
        },
      });
      if (existing) {
        this.logger.log(
          `Duplicate notification suppressed: type=${dto.type} userId=${dto.userId} entity=${dto.relatedEntityId}`,
        );
        return existing;
      }
    }

    const notification = this.notificationRepository.create({
      ...dto,
    });

    const saved = await this.notificationRepository.save(notification);

    this.eventEmitter.emit('notification.created', {
      userId: dto.userId,
      notification: saved,
    });

    this.logger.log(
      `NOTIFICATION_CREATED: type=${dto.type} userId=${dto.userId}`,
    );

    return saved;
  }

  async findByUser(userId: string, query: NotificationQueryDto) {
    const qb = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (query.isRead !== undefined) {
      qb.andWhere('notification.isRead = :isRead', { isRead: query.isRead });
    }

    if (query.type) {
      qb.andWhere('notification.type = :type', { type: query.type });
    }

    if (query.startDate) {
      qb.andWhere('notification.createdAt >= :startDate', {
        startDate: new Date(query.startDate),
      });
    }

    if (query.endDate) {
      qb.andWhere('notification.createdAt <= :endDate', {
        endDate: new Date(query.endDate),
      });
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    qb.skip((page - 1) * limit)
      .take(limit)
      .orderBy('notification.createdAt', 'DESC');

    const [notifications, total] = await qb.getManyAndCount();

    return {
      data: notifications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(userId: string, notificationIds?: string[]) {
    if (notificationIds && notificationIds.length > 0) {
      const result = await this.notificationRepository.update(
        { id: notificationIds as any, userId },
        { isRead: true, readAt: new Date() },
      );
      if (result.affected === 0) {
        throw new NotFoundException(
          'Notification not found or does not belong to user',
        );
      }
    } else {
      await this.notificationRepository.update(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() },
      );
    }

    return { message: 'Notifications marked as read' };
  }

  async markSingleAsRead(userId: string, notificationId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ForbiddenException(
        "Cannot mark another user's notification as read",
      );
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await this.notificationRepository.save(notification);

    return { message: 'Notification marked as read' };
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );

    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }

  async delete(id: string, userId: string) {
    const result = await this.notificationRepository.delete({ id, userId });
    if (result.affected === 0) {
      return { message: 'Notification not found or already deleted' };
    }
    return { message: 'Notification deleted' };
  }
}
