import { MessagesService } from './messages.service';
export declare class MessagesController {
    private readonly messagesService;
    constructor(messagesService: MessagesService);
    sendMessage(user: any, body: {
        receiverId: string;
        content: string;
        relatedType?: string;
        relatedId?: string;
    }): Promise<import("../../entities/message.entity").Message>;
    getMyConversations(user: any): Promise<import("../../entities/message.entity").Message[]>;
    getConversation(user: any, otherUserId: string): Promise<import("../../entities/message.entity").Message[]>;
    markAsRead(user: any, id: string): Promise<import("typeorm").UpdateResult>;
}
