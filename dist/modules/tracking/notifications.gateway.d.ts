import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private logger;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleSubscribe(client: Socket, data: {
        channel: string;
    }): {
        success: boolean;
    };
    handleUnsubscribe(client: Socket, data: {
        channel: string;
    }): {
        success: boolean;
    };
    sendNotification(userId: string, notification: any): void;
    sendBulkNotifications(userIds: string[], notification: any): void;
}
