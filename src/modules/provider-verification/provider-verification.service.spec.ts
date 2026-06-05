import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProviderVerificationService } from '../../../src/modules/provider-verification/provider-verification.service';
import { ProviderVerification } from '../../../src/entities/provider-verification.entity';
import { VerificationDocument } from '../../../src/entities/verification-document.entity';
import { ProviderProfile } from '../../../src/entities/provider-profile.entity';
import { HistoryService } from '../../../src/modules/provider-verification/services/history.service';
import { AuditService } from '../../../src/modules/provider-verification/services/audit.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProviderVerificationService', () => {
  let service: ProviderVerificationService;
  let verificationRepo: jest.Mocked<Repository<ProviderVerification>>;
  let documentRepo: jest.Mocked<Repository<VerificationDocument>>;
  let profileRepo: jest.Mocked<Repository<ProviderProfile>>;
  let historyService: jest.Mocked<HistoryService>;
  let eventEmitter: jest.Mocked<EventEmitter2>;

  const mockProviderId = 'provider-uuid';
  const mockProfile = { id: 'profile-uuid', userId: mockProviderId, businessName: 'Test Provider' } as ProviderProfile;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProviderVerificationService,
        {
          provide: getRepositoryToken(ProviderVerification),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(VerificationDocument),
          useValue: {
            count: jest.fn(),
            find: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderProfile),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: HistoryService,
          useValue: { recordChange: jest.fn() },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<ProviderVerificationService>(ProviderVerificationService);
    verificationRepo = module.get(getRepositoryToken(ProviderVerification));
    documentRepo = module.get(getRepositoryToken(VerificationDocument));
    profileRepo = module.get(getRepositoryToken(ProviderProfile));
    historyService = module.get(HistoryService);
    eventEmitter = module.get(EventEmitter2);
  });

  describe('submit', () => {
    it('should throw NotFoundException when provider profile does not exist', async () => {
      profileRepo.findOne.mockResolvedValue(null);

      await expect(service.submit(mockProviderId)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when verification is already under_review', async () => {
      profileRepo.findOne.mockResolvedValue(mockProfile);
      verificationRepo.findOne.mockResolvedValue({ status: 'under_review' } as ProviderVerification);

      await expect(service.submit(mockProviderId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when already approved', async () => {
      profileRepo.findOne.mockResolvedValue(mockProfile);
      verificationRepo.findOne.mockResolvedValue({ status: 'approved' } as ProviderVerification);

      await expect(service.submit(mockProviderId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when suspended', async () => {
      profileRepo.findOne.mockResolvedValue(mockProfile);
      verificationRepo.findOne.mockResolvedValue({ status: 'suspended' } as ProviderVerification);

      await expect(service.submit(mockProviderId)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when no documents uploaded', async () => {
      profileRepo.findOne.mockResolvedValue(mockProfile);
      verificationRepo.findOne.mockResolvedValue({ id: 'verification-uuid', providerId: mockProviderId, status: 'pending' } as ProviderVerification);
      documentRepo.count.mockResolvedValue(0);

      await expect(service.submit(mockProviderId)).rejects.toThrow(BadRequestException);
    });

    it('should submit successfully when all conditions met', async () => {
      const mockVerification = { id: 'verification-uuid', providerId: mockProviderId, status: 'pending' } as ProviderVerification;
      profileRepo.findOne.mockResolvedValue(mockProfile);
      verificationRepo.findOne.mockResolvedValue(mockVerification);
      documentRepo.count.mockResolvedValue(1);
      verificationRepo.save.mockResolvedValue({ ...mockVerification, status: 'under_review', submittedAt: new Date() });

      const result = await service.submit(mockProviderId);

      expect(result.status).toBe('under_review');
      expect(historyService.recordChange).toHaveBeenCalled();
      expect(eventEmitter.emit).toHaveBeenCalledWith('verification.submitted', expect.any(Object));
    });
  });

  describe('getStatus', () => {
    it('should throw NotFoundException when no verification exists', async () => {
      verificationRepo.findOne.mockResolvedValue(null);

      await expect(service.getStatus(mockProviderId)).rejects.toThrow(NotFoundException);
    });

    it('should return verification when it exists', async () => {
      const mockVerification = { id: 'uuid', providerId: mockProviderId, status: 'approved' } as ProviderVerification;
      verificationRepo.findOne.mockResolvedValue(mockVerification);

      const result = await service.getStatus(mockProviderId);
      expect(result).toBe(mockVerification);
    });
  });
});
