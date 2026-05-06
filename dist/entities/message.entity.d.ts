import { User } from './user.entity';
export declare class Message {
    id: string;
    sender: User;
    senderId: string;
    receiver: User;
    receiverId: string;
    content: string;
    relatedType: string;
    relatedId: string;
    isRead: boolean;
    createdAt: Date;
}
