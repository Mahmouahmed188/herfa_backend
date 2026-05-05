import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
export declare class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    server: Server;
    private logger;
    private connectedUsers;
    constructor(jwtService: JwtService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    handleUpdateLocation(client: Socket, data: {
        latitude: number;
        longitude: number;
        accuracy?: number;
        jobId?: string;
    }): {
        error: string;
        success?: undefined;
    } | {
        success: boolean;
        error?: undefined;
    };
    handleJoinJob(client: Socket, data: {
        jobId: string;
    }): {
        success: boolean;
    };
    handleLeaveJob(client: Socket, data: {
        jobId: string;
    }): {
        success: boolean;
    };
    handleJoinServiceRoom(client: Socket, data: {
        serviceId: string;
    }): {
        success: boolean;
    };
    emitToUser(userId: string, event: string, data: any): void;
    emitToJob(jobId: string, event: string, data: any): void;
    emitToServiceProviders(serviceId: string, event: string, data: any): void;
}
