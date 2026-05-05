import { NotificationsService } from './notifications.service';
import { MarkAsReadDto, NotificationQueryDto } from './dto/notifications.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    getNotifications(user: any, query: NotificationQueryDto): Promise<{
        data: import("../../entities").Notification[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getUnreadCount(user: any): Promise<{
        count: number;
    }>;
    markAsRead(user: any, dto: MarkAsReadDto): Promise<{
        message: string;
    }>;
    deleteNotification(id: string, user: any): Promise<{
        message: string;
    }>;
}
