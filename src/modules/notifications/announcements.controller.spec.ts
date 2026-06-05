import { Test, TestingModule } from '@nestjs/testing';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';
import { NotificationTargetAudience } from '../../common/constants/notification.enums';

describe('AnnouncementsController', () => {
  let controller: AnnouncementsController;

  const mockAdmin = { id: 'admin-uuid', role: 'admin' };

  const mockAnnouncementsService = {
    create: jest.fn().mockResolvedValue({
      id: 'announcement-uuid',
      title: 'Test',
      message: 'Test message',
      targetAudience: 'all',
      createdBy: 'admin-uuid',
      createdAt: new Date(),
    }),
    findAll: jest.fn().mockResolvedValue({
      items: [],
      total: 0,
    }),
    delete: jest.fn().mockResolvedValue({ message: 'Announcement deleted' }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementsController],
      providers: [
        { provide: AnnouncementsService, useValue: mockAnnouncementsService },
      ],
    }).compile();

    controller = module.get<AnnouncementsController>(AnnouncementsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create an announcement', async () => {
      const dto = {
        title: 'Test',
        message: 'Test message',
        targetAudience: NotificationTargetAudience.ALL,
      };

      const result = await controller.create(dto, mockAdmin);

      expect(mockAnnouncementsService.create).toHaveBeenCalledWith(dto, 'admin-uuid');
      expect(result.id).toBe('announcement-uuid');
    });
  });

  describe('findAll', () => {
    it('should return all announcements', async () => {
      const result = await controller.findAll();

      expect(mockAnnouncementsService.findAll).toHaveBeenCalled();
      expect(result.items).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete an announcement', async () => {
      const result = await controller.delete('announcement-uuid');

      expect(mockAnnouncementsService.delete).toHaveBeenCalledWith('announcement-uuid');
      expect(result.message).toBe('Announcement deleted');
    });
  });
});
