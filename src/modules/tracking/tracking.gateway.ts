import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/tracking',
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger('TrackingGateway');
  private connectedUsers = new Map<string, string>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.data.userId = payload.sub;
      client.data.role = payload.role;
      this.connectedUsers.set(client.id, payload.sub);

      client.join(`user:${payload.sub}`);
      this.logger.log(`Client connected: ${client.id} (user: ${payload.sub})`);
    } catch (error) {
      this.logger.error('Connection auth failed', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.connectedUsers.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('updateLocation')
  handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { latitude: number; longitude: number; accuracy?: number; jobId?: string },
  ) {
    const userId = client.data.userId;
    if (client.data.role !== 'provider') {
      return { error: 'Only providers can update location' };
    }

    client.to(`job:${data.jobId}`).emit('providerLocation', {
      providerId: userId,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date(),
    });

    return { success: true };
  }

  @SubscribeMessage('joinJob')
  handleJoinJob(@ConnectedSocket() client: Socket, @MessageBody() data: { jobId: string }) {
    client.join(`job:${data.jobId}`);
    return { success: true };
  }

  @SubscribeMessage('leaveJob')
  handleLeaveJob(@ConnectedSocket() client: Socket, @MessageBody() data: { jobId: string }) {
    client.leave(`job:${data.jobId}`);
    return { success: true };
  }

  @SubscribeMessage('joinServiceRoom')
  handleJoinServiceRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { serviceId: string }) {
    client.join(`service:${data.serviceId}:providers`);
    return { success: true };
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToJob(jobId: string, event: string, data: any) {
    this.server.to(`job:${jobId}`).emit(event, data);
  }

  emitToServiceProviders(serviceId: string, event: string, data: any) {
    this.server.to(`service:${serviceId}:providers`).emit(event, data);
  }
}