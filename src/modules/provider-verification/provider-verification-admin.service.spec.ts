import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProviderVerificationAdminService } from './provider-verification-admin.service';
import { ProviderVerification } from '../../entities/provider-verification.entity';
import { VerificationDocument } from '../../entities/verification-document.entity';
import { VerificationHistory } from '../../entities/verification-history.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { HistoryService } from './services/history.service';
import { AuditService } from './services/audit.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProviderVerificationAdminService', () => {
  let service: ProviderVerificationAdminService;

  const mockAdminId = 'admin-uuid';
  const mockProviderId = 'provider-uuid';

  const mockVerification = (overrides: Partial<ProviderVerification> = {}): ProviderVerification =>
    ({ id: 'verification-uuid', providerId: mockProviderId, status: 'under_review', ...overrides }) as ProviderVerification;

  const createModule = async (overrides?: { verificationRepo?: any; profileRepo?: any; historyService?: any; eventEmitter?: any }) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderVerificationAdminService,
        {
          provide: getRepositoryToken(ProviderVerification),
          useValue: overrides?.verificationRepo ?? {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              andWhere: jest.fn().mockReturnThis(),
              skip: jest.fn().mockReturnThis(),
              take: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
            })),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(VerificationDocument),
          useValue: { find: jest.fn(), count: jest.fn().mockResolvedValue(0) },
        },
        {
          provide: getRepositoryToken(VerificationHistory),
          useValue: { find: jest.fn() },
        },
        {
          provide: getRepositoryToken(ProviderProfile),
          useValue: overrides?.profileRepo ?? { findOne: jest.fn(), update: jest.fn() },
        },
        {
          provide: HistoryService,
          useValue: overrides?.historyService ?? { recordChange: jest.fn() },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
        {
          provide: EventEmitter2,
          useValue: overrides?.eventEmitter ?? { emit: jest.fn() },
        },
      ],
    }).compile();

    return module.get<ProviderVerificationAdminService>(ProviderVerificationAdminService);
  };

  describe('approve', () => {
    it('should approve verification successfully', async () => {
      const verificationRepo = { findOne: jest.fn().mockResolvedValue(mockVerification()), save: jest.fn().mockResolvedValue(mockVerification({ status: 'approved' })) };
      const profileRepo = { findOne: jest.fn().mockResolvedValue({ id: 'puuid', userId: mockProviderId } as ProviderProfile), update: jest.fn() };
      const historyService = { recordChange: jest.fn() };
      const eventEmitter = { emit: jest.fn() };
      service = await createModule({ verificationRepo, profileRepo, historyService, eventEmitter });

      const result = await service.approve('verification-uuid', mockAdminId);

      expect(result.status).toBe('approved');
      expect(historyService.recordChange).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('verification.approved', expect.any(Object));
    });

    it('should throw NotFoundException when verification not found', async () => {
      const verificationRepo = { findOne: jest.fn().mockResolvedValue(null), save: jest.fn() };
      service = await createModule({ verificationRepo });

      await expect(service.approve('invalid-id', mockAdminId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when transitioning from invalid status', async () => {
      const verificationRepo = { findOne: jest.fn().mockResolvedValue(mockVerification({ status: 'approved' })), save: jest.fn() };
      service = await createModule({ verificationRepo });

      await expect(service.approve('verification-uuid', mockAdminId)).rejects.toThrow(BadRequestException);
    });

    it('should reject self-approval', async () => {
      const verificationRepo = { findOne: jest.fn().mockResolvedValue(mockVerification({ providerId: mockAdminId })), save: jest.fn() };
      service = await createModule({ verificationRepo });

      await expect(service.approve('verification-uuid', mockAdminId)).rejects.toThrow(BadRequestException);
    });
  });

  describe('reject', () => {
    it('should reject verification successfully', async () => {
      const verificationRepo = { findOne: jest.fn().mockResolvedValue(mockVerification()), save: jest.fn().mockResolvedValue(mockVerification({ status: 'rejected' })) };
      const profileRepo = { findOne: jest.fn().mockResolvedValue({ id: 'puuid', userId: mockProviderId } as ProviderProfile), update: jest.fn() };
      const historyService = { recordChange: jest.fn() };
      const eventEmitter = { emit: jest.fn() };
      service = await createModule({ verificationRepo, profileRepo, historyService, eventEmitter });

      const result = await service.reject('verification-uuid', mockAdminId, 'Documents are invalid');

      expect(result.status).toBe('rejected');
      expect(historyService.recordChange).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('verification.rejected', expect.any(Object));
    });

    it('should throw BadRequestException when reason is missing', async () => {
      const verificationRepo = { findOne: jest.fn().mockResolvedValue(mockVerification()), save: jest.fn() };
      service = await createModule({ verificationRepo });

      await expect(service.reject('verification-uuid', mockAdminId, '')).rejects.toThrow(BadRequestException);
    });
  });

  describe('suspend', () => {
    it('should suspend an approved provider', async () => {
      const verificationRepo = { findOne: jest.fn().mockResolvedValue(mockVerification({ status: 'approved' })), save: jest.fn().mockResolvedValue(mockVerification({ status: 'suspended' })) };
      const profileRepo = { findOne: jest.fn().mockResolvedValue({ id: 'puuid', userId: mockProviderId } as ProviderProfile), update: jest.fn() };
      const historyService = { recordChange: jest.fn() };
      const eventEmitter = { emit: jest.fn() };
      service = await createModule({ verificationRepo, profileRepo, historyService, eventEmitter });

      const result = await service.suspend('verification-uuid', mockAdminId, 'Policy violation');

      expect(result.status).toBe('suspended');
      expect(historyService.recordChange).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('verification.suspended', expect.any(Object));
    });

    it('should require suspension reason', async () => {
      const verificationRepo = { findOne: jest.fn().mockResolvedValue(mockVerification({ status: 'approved' })), save: jest.fn() };
      service = await createModule({ verificationRepo });

      await expect(service.suspend('verification-uuid', mockAdminId, '')).rejects.toThrow(BadRequestException);
    });
  });

  describe('reactivate', () => {
    it('should reactivate a suspended provider', async () => {
      const verificationRepo = { findOne: jest.fn().mockResolvedValue(mockVerification({ status: 'suspended' })), save: jest.fn().mockResolvedValue(mockVerification({ status: 'approved' })) };
      const profileRepo = { findOne: jest.fn().mockResolvedValue({ id: 'puuid', userId: mockProviderId } as ProviderProfile), update: jest.fn() };
      const historyService = { recordChange: jest.fn() };
      const eventEmitter = { emit: jest.fn() };
      service = await createModule({ verificationRepo, profileRepo, historyService, eventEmitter });

      const result = await service.reactivate('verification-uuid', mockAdminId);

      expect(result.status).toBe('approved');
      expect(historyService.recordChange).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('verification.approved', expect.any(Object));
    });
  });
});
