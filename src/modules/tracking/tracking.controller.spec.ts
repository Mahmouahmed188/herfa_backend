import { Test, TestingModule } from '@nestjs/testing';
import { TrackingController } from './tracking.controller';
import { TrackingService } from './tracking.service';

describe('TrackingController', () => {
  let controller: TrackingController;
  let service: TrackingService;

  const mockTrackingService = {
    getSession: jest.fn(),
    getHistory: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrackingController],
      providers: [
        {
          provide: TrackingService,
          useValue: mockTrackingService,
        },
      ],
    }).compile();

    controller = module.get<TrackingController>(TrackingController);
    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTracking', () => {
    it('should return tracking session', async () => {
      const result = {
        sessionId: 'session-1',
        bookingId: 'booking-1',
        providerId: 'provider-1',
        status: 'active',
        currentLocation: null,
        startedAt: new Date(),
        endedAt: null,
      };
      mockTrackingService.getSession.mockResolvedValue(result);

      const response = await controller.getTracking('booking-1', 'customer-1');

      expect(response.success).toBe(true);
      expect(response.data.sessionId).toBe('session-1');
      expect(mockTrackingService.getSession).toHaveBeenCalledWith('booking-1', 'customer-1');
    });
  });

  describe('getHistory', () => {
    it('should return paginated history', async () => {
      const result = {
        items: [],
        total: 0,
        page: 1,
        limit: 50,
        totalPages: 0,
      };
      mockTrackingService.getHistory.mockResolvedValue(result);

      const response = await controller.getHistory('booking-1', 'customer-1', 1, 50);

      expect(response.success).toBe(true);
      expect(response.data.total).toBe(0);
      expect(mockTrackingService.getHistory).toHaveBeenCalledWith('booking-1', 'customer-1', { page: 1, limit: 50 });
    });
  });
});
