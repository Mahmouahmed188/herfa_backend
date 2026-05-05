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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const notification_entity_1 = require("../../entities/notification.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
let NotificationsService = class NotificationsService {
    notificationRepository;
    eventEmitter;
    constructor(notificationRepository, eventEmitter) {
        this.notificationRepository = notificationRepository;
        this.eventEmitter = eventEmitter;
    }
    async create(dto) {
        const notification = this.notificationRepository.create({
            ...dto,
        });
        const saved = await this.notificationRepository.save(notification);
        this.eventEmitter.emit('notification.created', {
            userId: dto.userId,
            notification: saved,
        });
        return saved;
    }
    async findByUser(userId, query) {
        const qb = this.notificationRepository
            .createQueryBuilder('notification')
            .where('notification.userId = :userId', { userId });
        if (query.isRead !== undefined) {
            qb.andWhere('notification.isRead = :isRead', { isRead: query.isRead });
        }
        const page = query.page || 1;
        const limit = query.limit || 20;
        qb.skip((page - 1) * limit).take(limit).orderBy('notification.createdAt', 'DESC');
        const [notifications, total] = await qb.getManyAndCount();
        return {
            data: notifications,
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    async markAsRead(userId, notificationIds) {
        if (notificationIds && notificationIds.length > 0) {
            await this.notificationRepository.update({ id: notificationIds, userId }, { isRead: true, readAt: new Date() });
        }
        else {
            await this.notificationRepository.update({ userId, isRead: false }, { isRead: true, readAt: new Date() });
        }
        return { message: 'Notifications marked as read' };
    }
    async getUnreadCount(userId) {
        return this.notificationRepository.count({
            where: { userId, isRead: false },
        });
    }
    async delete(id, userId) {
        const result = await this.notificationRepository.delete({ id, userId });
        if (result.affected === 0) {
            return { message: 'Notification not found or already deleted' };
        }
        return { message: 'Notification deleted' };
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(notification_entity_1.Notification)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        event_emitter_1.EventEmitter2])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map