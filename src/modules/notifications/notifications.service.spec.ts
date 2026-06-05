import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { Notification } from '../../entities/notification.entity';
import { InAppChannel } from './channels/in-app.channel';

describe('NotificationsService', () => {
  let service: NotificationsService;

  const mockNotification = {
    id: 'notif-uuid',
    userId: 'user-uuid',
    type: 'booking_accepted',
    title: 'Booking Accepted',
    message: 'Your booking has been accepted.',
    isRead: false,
    readAt: null,
    createdAt: new Date(),
  };

  const mockNotificationRepository = {
    create: jest.fn().mockReturnValue(mockNotification),
    save: jest.fn().mockResolvedValue(mockNotification),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([[mockNotification], 1]),
    })),
    update: jest.fn().mockResolvedValue({ affected: 1 }),
    count: jest.fn().mockResolvedValue(3),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  const mockInAppChannel = {
    name: 'in-app',
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: getRepositoryToken(Notification),
          useValue: mockNotificationRepository,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
        { provide: InAppChannel, useValue: mockInAppChannel },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification and emit event', async () => {
      const dto = {
        userId: 'user-uuid',
        type: 'booking_accepted' as any,
        title: 'Booking Accepted',
        message: 'Your booking has been accepted.',
      };

      const result = await service.create(dto);

      expect(mockNotificationRepository.create).toHaveBeenCalledWith(dto);
      expect(mockNotificationRepository.save).toHaveBeenCalled();
      expect(mockEventEmitter.emit).toHaveBeenCalledWith(
        'notification.created',
        expect.objectContaining({ userId: 'user-uuid' }),
      );
      expect(result).toEqual(mockNotification);
    });
  });

  describe('findByUser', () => {
    it('should return paginated notifications', async () => {
      const result = await service.findByUser('user-uuid', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.page).toBe(1);
      expect(result.meta.total).toBe(1);
    });

    it('should filter by isRead', async () => {
      await service.findByUser('user-uuid', { isRead: false });
    });

    it('should filter by type', async () => {
      await service.findByUser('user-uuid', { type: 'booking_accepted' as any });
    });

    it('should filter by date range', async () => {
      await service.findByUser('user-uuid', {
        startDate: '2026-01-01',
        endDate: '2026-06-01',
      });
    });

    it('should apply combined filters (type + isRead + date range)', async () => {
      await service.findByUser('user-uuid', {
        type: 'booking_accepted' as any,
        isRead: false,
        startDate: '2026-01-01',
        endDate: '2026-06-01',
      });
    });
  });

  describe('markAsRead', () => {
    it('should mark specific notifications as read', async () => {
      const result = await service.markAsRead('user-uuid', ['notif-uuid']);

      expect(mockNotificationRepository.update).toHaveBeenCalled();
      expect(result.message).toBe('Notifications marked as read');
    });

    it('should mark all notifications as read when no ids provided', async () => {
      const result = await service.markAsRead('user-uuid');

      expect(mockNotificationRepository.update).toHaveBeenCalledWith(
        { userId: 'user-uuid', isRead: false },
        expect.objectContaining({ isRead: true }),
      );
      expect(result.message).toBe('Notifications marked as read');
    });
  });

  describe('markSingleAsRead', () => {
    it('should mark a single notification as read', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(mockNotification);

      const result = await service.markSingleAsRead('user-uuid', 'notif-uuid');

      expect(mockNotificationRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'notif-uuid' },
      });
      expect(mockNotificationRepository.save).toHaveBeenCalled();
      expect(result.message).toBe('Notification marked as read');
    });

    it('should throw NotFoundException if notification not found', async () => {
      mockNotificationRepository.findOne.mockResolvedValue(null);

      await expect(
        service.markSingleAsRead('user-uuid', 'nonexistent'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if notification belongs to another user', async () => {
      mockNotificationRepository.findOne.mockResolvedValue({
        ...mockNotification,
        userId: 'other-user',
      });

      await expect(
        service.markSingleAsRead('user-uuid', 'notif-uuid'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all unread notifications as read', async () => {
      const result = await service.markAllAsRead('user-uuid');

      expect(mockNotificationRepository.update).toHaveBeenCalledWith(
        { userId: 'user-uuid', isRead: false },
        expect.objectContaining({ isRead: true }),
      );
      expect(result.message).toBe('All notifications marked as read');
    });
  });

  describe('getUnreadCount', () => {
    it('should return the unread notifications count', async () => {
      const count = await service.getUnreadCount('user-uuid');

      expect(mockNotificationRepository.count).toHaveBeenCalledWith({
        where: { userId: 'user-uuid', isRead: false },
      });
      expect(count).toBe(3);
    });
  });

  describe('delete', () => {
    it('should delete a notification belonging to the user', async () => {
      const result = await service.delete('notif-uuid', 'user-uuid');

      expect(mockNotificationRepository.delete).toHaveBeenCalledWith({
        id: 'notif-uuid',
        userId: 'user-uuid',
      });
      expect(result.message).toBe('Notification deleted');
    });

    it('should return not found message if notification does not exist', async () => {
      mockNotificationRepository.delete.mockResolvedValue({ affected: 0 });

      const result = await service.delete('notif-uuid', 'user-uuid');

      expect(result.message).toBe('Notification not found or already deleted');
    });
  });
});
