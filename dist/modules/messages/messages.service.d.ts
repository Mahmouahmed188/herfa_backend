import { Repository } from 'typeorm';
import { Message } from '../../entities/message.entity';
export declare class MessagesService {
    private messageRepository;
    constructor(messageRepository: Repository<Message>);
    sendMessage(senderId: string, receiverId: string, content: string, relatedType?: string, relatedId?: string): Promise<Message>;
    getMyConversations(userId: string): Promise<Message[]>;
    getConversation(userId: string, otherUserId: string): Promise<Message[]>;
    markAsRead(userId: string, messageId: string): Promise<import("typeorm").UpdateResult>;
}
