import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HistoryService } from './history.service';
import { VerificationHistory } from '../../../entities/verification-history.entity';

describe('HistoryService', () => {
  let service: HistoryService;
  let historyRepo: jest.Mocked<Repository<VerificationHistory>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: getRepositoryToken(VerificationHistory),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    historyRepo = module.get(getRepositoryToken(VerificationHistory));
  });

  describe('recordChange', () => {
    it('should create a history entry', async () => {
      const params = {
        verificationId: 'verification-uuid',
        oldStatus: 'pending',
        newStatus: 'under_review',
        changedBy: 'provider-uuid',
        changedByRole: 'provider',
        notes: 'Provider submitted verification',
      };

      historyRepo.create.mockReturnValue({
        id: 'history-uuid',
        ...params,
      } as any);
      historyRepo.save.mockResolvedValue({
        id: 'history-uuid',
        ...params,
      } as VerificationHistory);

      const result = await service.recordChange(params);

      expect(result).toBeDefined();
      expect(result.newStatus).toBe('under_review');
    });
  });

  describe('findByVerificationId', () => {
    it('should return history entries ordered by createdAt', async () => {
      const entries = [
        { id: '1', createdAt: new Date('2026-01-01') },
        { id: '2', createdAt: new Date('2026-01-02') },
      ] as VerificationHistory[];

      historyRepo.find.mockResolvedValue(entries);

      const result = await service.findByVerificationId('verification-uuid');

      expect(result).toHaveLength(2);
      expect(historyRepo.find).toHaveBeenCalledWith({
        where: { verificationId: 'verification-uuid' },
        order: { createdAt: 'ASC' },
      });
    });
  });
});
