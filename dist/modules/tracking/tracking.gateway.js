"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TrackingGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const common_1 = require("@nestjs/common");
let TrackingGateway = class TrackingGateway {
    jwtService;
    server;
    logger = new common_1.Logger('TrackingGateway');
    connectedUsers = new Map();
    constructor(jwtService) {
        this.jwtService = jwtService;
    }
    async handleConnection(client) {
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
        }
        catch (error) {
            this.logger.error('Connection auth failed', error);
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.connectedUsers.delete(client.id);
        this.logger.log(`Client disconnected: ${client.id}`);
    }
    handleUpdateLocation(client, data) {
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
    handleJoinJob(client, data) {
        client.join(`job:${data.jobId}`);
        return { success: true };
    }
    handleLeaveJob(client, data) {
        client.leave(`job:${data.jobId}`);
        return { success: true };
    }
    handleJoinServiceRoom(client, data) {
        client.join(`service:${data.serviceId}:providers`);
        return { success: true };
    }
    emitToUser(userId, event, data) {
        this.server.to(`user:${userId}`).emit(event, data);
    }
    emitToJob(jobId, event, data) {
        this.server.to(`job:${jobId}`).emit(event, data);
    }
    emitToServiceProviders(serviceId, event, data) {
        this.server.to(`service:${serviceId}:providers`).emit(event, data);
    }
};
exports.TrackingGateway = TrackingGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], TrackingGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('updateLocation'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleUpdateLocation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinJob'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleJoinJob", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveJob'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleLeaveJob", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinServiceRoom'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", void 0)
], TrackingGateway.prototype, "handleJoinServiceRoom", null);
exports.TrackingGateway = TrackingGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*', credentials: true },
        namespace: '/tracking',
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService])
], TrackingGateway);
//# sourceMappingURL=tracking.gateway.js.map