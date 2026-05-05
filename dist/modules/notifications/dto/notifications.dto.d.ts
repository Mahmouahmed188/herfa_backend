import { NotificationType } from '../../../common/constants/user.enums';
export declare class CreateNotificationDto {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl?: string;
    data?: Record<string, any>;
}
export declare class MarkAsReadDto {
    notificationIds?: string[];
}
export declare class NotificationQueryDto {
    page?: number;
    limit?: number;
    isRead?: boolean;
}
