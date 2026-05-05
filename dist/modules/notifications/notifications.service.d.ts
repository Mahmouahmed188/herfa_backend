import { Repository } from 'typeorm';
import { Notification } from '../../entities/notification.entity';
import { CreateNotificationDto, NotificationQueryDto } from './dto/notifications.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
export declare class NotificationsService {
    private notificationRepository;
    private eventEmitter;
    constructor(notificationRepository: Repository<Notification>, eventEmitter: EventEmitter2);
    create(dto: CreateNotificationDto): Promise<Notification>;
    findByUser(userId: string, query: NotificationQueryDto): Promise<{
        data: Notification[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    markAsRead(userId: string, notificationIds?: string[]): Promise<{
        message: string;
    }>;
    getUnreadCount(userId: string): Promise<number>;
    delete(id: string, userId: string): Promise<{
        message: string;
    }>;
}
