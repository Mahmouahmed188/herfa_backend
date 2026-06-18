import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { NotificationAnnouncement } from '../../entities/notification-announcement.entity';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationTargetAudience } from '../../common/constants/notification.enums';
import { AnnouncementQueryDto } from './dto/announcements.dto';

describe('AnnouncementsService', () => {
  let service: AnnouncementsService;

  const mockAnnouncement = {
    id: 'announcement-uuid',
    title: 'System Maintenance',
    message: 'System will be down tonight.',
    targetAudience: 'all',
    createdBy: 'admin-uuid',
    createdAt: new Date(),
  };

  const mockAnnouncementRepository = {
    create: jest.fn().mockReturnValue(mockAnnouncement),
    save: jest.fn().mockResolvedValue(mockAnnouncement),
    findAndCount: jest.fn().mockResolvedValue([[mockAnnouncement], 1]),
    delete: jest.fn().mockResolvedValue({ affected: 1 }),
  };

  const mockNotificationsService = {
    create: jest.fn().mockResolvedValue({ id: 'notif-uuid' }),
  };

  const mockPrisma = {
    user: {
      findMany: jest
        .fn()
        .mockResolvedValue([
          { id: 'user-1' },
          { id: 'user-2' },
          { id: 'user-3' },
        ]),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnnouncementsService,
        {
          provide: getRepositoryToken(NotificationAnnouncement),
          useValue: mockAnnouncementRepository,
        },
        { provide: NotificationsService, useValue: mockNotificationsService },
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnnouncementsService>(AnnouncementsService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create announcement and send to all active users', async () => {
      const dto = {
        title: 'Test',
        message: 'Test message',
        targetAudience: NotificationTargetAudience.ALL,
      };

      const result = await service.create(dto, 'admin-uuid');

      expect(mockAnnouncementRepository.create).toHaveBeenCalled();
      expect(mockAnnouncementRepository.save).toHaveBeenCalled();
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({
        where: { status: 'active' },
        select: { id: true },
      });
      expect(mockNotificationsService.create).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockAnnouncement);
    });

    it('should create announcement for individual user', async () => {
      const dto = {
        title: 'Test',
        message: 'Test message',
        targetAudience: NotificationTargetAudience.INDIVIDUAL,
        targetUserId: 'specific-user',
      };

      await service.create(dto, 'admin-uuid');

      expect(mockNotificationsService.create).toHaveBeenCalledTimes(1);
      expect(mockNotificationsService.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: 'specific-user' }),
      );
    });

    it('should throw if individual audience without targetUserId', async () => {
      const dto = {
        title: 'Test',
        message: 'Test message',
        targetAudience: NotificationTargetAudience.INDIVIDUAL,
      };

      await expect(service.create(dto, 'admin-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return all announcements', async () => {
      const query: AnnouncementQueryDto = { page: 1, limit: 20 };
      const result = await service.findAll(query);

      expect(mockAnnouncementRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 20,
        skip: 0,
      });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should return paginated announcements with custom limit', async () => {
      const query: AnnouncementQueryDto = { page: 2, limit: 5 };
      const result = await service.findAll(query);

      expect(mockAnnouncementRepository.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 5,
        skip: 5,
      });
      expect(result.limit).toBe(5);
      expect(result.page).toBe(2);
    });
  });

  describe('delete', () => {
    it('should delete an announcement', async () => {
      const result = await service.delete('announcement-uuid');

      expect(mockAnnouncementRepository.delete).toHaveBeenCalledWith(
        'announcement-uuid',
      );
      expect(result.message).toBe('Announcement deleted');
    });

    it('should throw NotFoundException if announcement not found', async () => {
      mockAnnouncementRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
