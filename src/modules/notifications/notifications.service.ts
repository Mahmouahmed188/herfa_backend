import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notifications.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateNotificationDto) {
    const notification = this.notificationRepository.create({
      ...dto,
    });

    const saved = await this.notificationRepository.save(notification);

    this.eventEmitter.emit('notification.created', {
      userId: dto.userId,
      notification: saved,
    });

    return saved;
  }

  async findByUser(userId: string, query: NotificationQueryDto) {
    const qb = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    if (query.isRead !== undefined) {
      qb.andWhere('notification.isRead = :isRead', { isRead: query.isRead });
    }

    const page = query.page || 1;
    const limit = query.limit || 20;
    qb.skip((page - 1) * limit).take(limit).orderBy('notification.createdAt', 'DESC');

    const [notifications, total] = await qb.getManyAndCount();

    return {
      data: notifications,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async markAsRead(userId: string, notificationIds?: string[]) {
    if (notificationIds && notificationIds.length > 0) {
      await this.notificationRepository.update(
        { id: (notificationIds as any), userId },
        { isRead: true, readAt: new Date() },
      );
    } else {
      await this.notificationRepository.update(
        { userId, isRead: false },
        { isRead: true, readAt: new Date() },
      );
    }

    return { message: 'Notifications marked as read' };
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