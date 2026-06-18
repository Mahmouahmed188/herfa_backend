import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';

describe('NotificationsController', () => {
  let controller: NotificationsController;

  const mockUser = { id: 'user-uuid', role: 'customer' };

  const mockNotificationsService = {
    findByUser: jest.fn().mockResolvedValue({
      data: [],
      meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
    }),
    getUnreadCount: jest.fn().mockResolvedValue(3),
    markSingleAsRead: jest
      .fn()
      .mockResolvedValue({ message: 'Notification marked as read' }),
    markAllAsRead: jest
      .fn()
      .mockResolvedValue({ message: 'All notifications marked as read' }),
    markAsRead: jest
      .fn()
      .mockResolvedValue({ message: 'Notifications marked as read' }),
    delete: jest.fn().mockResolvedValue({ message: 'Notification deleted' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationsController],
      providers: [
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    controller = module.get<NotificationsController>(NotificationsController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getNotifications', () => {
    it('should return paginated notifications', async () => {
      const result = await controller.getNotifications(mockUser, {
        page: 1,
        limit: 20,
      });

      expect(mockNotificationsService.findByUser).toHaveBeenCalledWith(
        'user-uuid',
        {
          page: 1,
          limit: 20,
        },
      );
      expect(result.data).toBeDefined();
      expect(result.meta).toBeDefined();
    });
  });

  describe('getUnreadCount', () => {
    it('should return unread count', async () => {
      const result = await controller.getUnreadCount(mockUser);

      expect(mockNotificationsService.getUnreadCount).toHaveBeenCalledWith(
        'user-uuid',
      );
      expect(result).toEqual({ count: 3 });
    });
  });

  describe('markAsRead', () => {
    it('should mark single notification as read', async () => {
      const result = await controller.markAsRead('notif-uuid', mockUser);

      expect(mockNotificationsService.markSingleAsRead).toHaveBeenCalledWith(
        'user-uuid',
        'notif-uuid',
      );
      expect(result.message).toBe('Notification marked as read');
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const result = await controller.markAllAsRead(mockUser);

      expect(mockNotificationsService.markAllAsRead).toHaveBeenCalledWith(
        'user-uuid',
      );
      expect(result.message).toBe('All notifications marked as read');
    });
  });

  describe('markAsReadBulk', () => {
    it('should mark specific notifications as read', async () => {
      const dto = { notificationIds: ['notif-1', 'notif-2'] };
      const result = await controller.markAsReadBulk(mockUser, dto);

      expect(mockNotificationsService.markAsRead).toHaveBeenCalledWith(
        'user-uuid',
        ['notif-1', 'notif-2'],
      );
      expect(result.message).toBe('Notifications marked as read');
    });
  });

  describe('deleteNotification', () => {
    it('should delete a notification', async () => {
      const result = await controller.deleteNotification(
        'notif-uuid',
        mockUser,
      );

      expect(mockNotificationsService.delete).toHaveBeenCalledWith(
        'notif-uuid',
        'user-uuid',
      );
      expect(result.message).toBe('Notification deleted');
    });
  });
});
