import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from '../../../entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  let auditRepo: jest.Mocked<Repository<AuditLog>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditRepo = module.get(getRepositoryToken(AuditLog));
  });

  describe('log', () => {
    it('should create an audit log entry', async () => {
      const params = {
        action: 'VERIFICATION_SUBMITTED',
        entityType: 'provider_verification',
        entityId: 'verification-uuid',
        actorId: 'provider-uuid',
        actorRole: 'provider',
        metadata: { previousStatus: 'pending', newStatus: 'under_review' },
      };

      auditRepo.create.mockReturnValue({ id: 'audit-uuid' } as any);
      auditRepo.save.mockResolvedValue({ id: 'audit-uuid' } as AuditLog);

      const result = await service.log(params);

      expect(result).toBeDefined();
      expect(auditRepo.create).toHaveBeenCalled();
      expect(auditRepo.save).toHaveBeenCalled();
    });
  });
});
