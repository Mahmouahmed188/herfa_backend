import { Test, TestingModule } from '@nestjs/testing';
import { ProviderTrackingController } from './provider-tracking.controller';
import { TrackingService } from './tracking.service';

describe('ProviderTrackingController', () => {
  let controller: ProviderTrackingController;
  let service: TrackingService;

  const mockTrackingService = {
    startSession: jest.fn(),
    updateLocation: jest.fn(),
    getActiveSessionByProvider: jest.fn(),
    getPausedSessionByProvider: jest.fn(),
    pauseSession: jest.fn(),
    resumeSession: jest.fn(),
    completeSession: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderTrackingController],
      providers: [
        {
          provide: TrackingService,
          useValue: mockTrackingService,
        },
      ],
    }).compile();

    controller = module.get<ProviderTrackingController>(ProviderTrackingController);
    service = module.get<TrackingService>(TrackingService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('start', () => {
    it('should start tracking session', async () => {
      const session = {
        id: 'session-1',
        bookingId: 'booking-1',
        status: 'active',
        startedAt: new Date(),
      };
      mockTrackingService.startSession.mockResolvedValue(session);

      const result = await controller.start({ bookingId: 'booking-1' }, 'provider-1');

      expect(result.success).toBe(true);
      expect(result.data.id).toBe('session-1');
      expect(mockTrackingService.startSession).toHaveBeenCalledWith('booking-1', 'provider-1');
    });
  });

  describe('pause', () => {
    it('should pause active session', async () => {
      mockTrackingService.getActiveSessionByProvider.mockResolvedValue({ id: 'session-1' });
      mockTrackingService.pauseSession.mockResolvedValue({ id: 'session-1', status: 'paused' });

      const result: any = await controller.pause({ id: 'provider-1' });

      expect(result.success).toBe(true);
      expect(result.data.newStatus).toBe('paused');
    });
  });

  describe('complete', () => {
    it('should complete session', async () => {
      mockTrackingService.getActiveSessionByProvider.mockResolvedValue({ id: 'session-1' });
      mockTrackingService.completeSession.mockResolvedValue({
        id: 'session-1',
        status: 'completed',
        endedAt: new Date(),
      });

      const result: any = await controller.complete({ id: 'provider-1' });

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('completed');
    });
  });
});
