import { User } from './user.entity';
import { NotificationType } from '../common/constants/user.enums';
export declare class Notification {
    id: string;
    user: User;
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    actionUrl: string;
    isRead: boolean;
    readAt: Date;
    data: Record<string, any>;
    createdAt: Date;
}
