import { Test, TestingModule } from '@nestjs/testing';
import { AdminTrackingController } from './admin-tracking.controller';
import { TrackingService } from './tracking.service';
import { TrackingFilterDto } from './dto/tracking-filter.dto';

describe('AdminTrackingController', () => {
  let controller: AdminTrackingController;
  let service: TrackingService;

  const mockTrackingService = {
    getAdminSessions: jest.fn(),
    getAdminSessionDetail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminTrackingController],
      providers: [
        {
          provide: TrackingService,
          useValue: mockTrackingService,
        },
      ],
    }).compile();

    controller = module.get<AdminTrackingController>(AdminTrackingController);
    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated sessions', async () => {
      const result = {
        items: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      };
      mockTrackingService.getAdminSessions.mockResolvedValue(result);

      const filter = new TrackingFilterDto();
      const response = await controller.findAll(filter);

      expect(response.success).toBe(true);
      expect(response.data.total).toBe(0);
      expect(mockTrackingService.getAdminSessions).toHaveBeenCalledWith(filter);
    });
  });

  describe('findOne', () => {
    it('should return session detail', async () => {
      const result = {
        session: { id: 'session-1' },
        locations: { items: [], total: 0, page: 1, limit: 0, totalPages: 0 },
      };
      mockTrackingService.getAdminSessionDetail.mockResolvedValue(result);

      const response = await controller.findOne('session-1');

      expect(response.success).toBe(true);
      expect(response.data.session.sessionId).toBe('session-1');
      expect(mockTrackingService.getAdminSessionDetail).toHaveBeenCalledWith(
        'session-1',
      );
    });
  });
});
