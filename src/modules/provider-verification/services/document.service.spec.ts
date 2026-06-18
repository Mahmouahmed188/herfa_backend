import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentService } from './document.service';
import {
  VerificationDocument,
  DocumentType,
} from '../../../entities/verification-document.entity';
import { ProviderVerification } from '../../../entities/provider-verification.entity';
import { LocalStorageProvider } from './local-storage-provider.service';
import { AuditService } from './audit.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('DocumentService', () => {
  let service: DocumentService;
  let documentRepo: jest.Mocked<Repository<VerificationDocument>>;
  let verificationRepo: jest.Mocked<Repository<ProviderVerification>>;
  let auditService: jest.Mocked<AuditService>;

  const mockFile = {
    originalname: 'id-card.pdf',
    mimetype: 'application/pdf',
    size: 204800,
    filename: 'abc123.pdf',
  } as Express.Multer.File;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getRepositoryToken(VerificationDocument),
          useValue: {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProviderVerification),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: LocalStorageProvider,
          useValue: {
            upload: jest.fn().mockResolvedValue('/uploads/abc123.pdf'),
            delete: jest.fn(),
          },
        },
        {
          provide: AuditService,
          useValue: { log: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
    documentRepo = module.get(getRepositoryToken(VerificationDocument));
    verificationRepo = module.get(getRepositoryToken(ProviderVerification));
    auditService = module.get(AuditService);
  });

  describe('upload', () => {
    it('should upload a document successfully', async () => {
      verificationRepo.findOne.mockResolvedValue(null);
      verificationRepo.create.mockReturnValue({
        id: 'verification-uuid',
        providerId: 'provider-uuid',
        status: 'pending',
      } as ProviderVerification);
      verificationRepo.save.mockResolvedValue({
        id: 'verification-uuid',
        providerId: 'provider-uuid',
        status: 'pending',
      } as ProviderVerification);
      documentRepo.create.mockReturnValue({
        id: 'doc-uuid',
      } as VerificationDocument);
      documentRepo.save.mockResolvedValue({
        id: 'doc-uuid',
      } as VerificationDocument);

      const result = await service.upload(
        mockFile,
        DocumentType.NATIONAL_ID,
        'provider-uuid',
      );

      expect(result).toBeDefined();
      expect(auditService.log).toHaveBeenCalled();
    });

    it('should throw when verification is not pending', async () => {
      verificationRepo.findOne.mockResolvedValue({
        id: 'v-uuid',
        providerId: 'provider-uuid',
        status: 'under_review',
      } as ProviderVerification);

      await expect(
        service.upload(mockFile, DocumentType.NATIONAL_ID, 'provider-uuid'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a document successfully when pending', async () => {
      const mockDoc = {
        id: 'doc-uuid',
        verificationId: 'verification-uuid',
        documentUrl: '/uploads/test.pdf',
      } as VerificationDocument;
      documentRepo.findOne.mockResolvedValue(mockDoc);
      verificationRepo.findOne.mockResolvedValue({
        id: 'verification-uuid',
        status: 'pending',
      } as ProviderVerification);
      documentRepo.remove.mockResolvedValue(mockDoc);

      await service.delete('doc-uuid', 'provider-uuid');

      expect(documentRepo.remove).toHaveBeenCalledWith(mockDoc);
    });

    it('should throw NotFoundException when document not found', async () => {
      documentRepo.findOne.mockResolvedValue(null);

      await expect(
        service.delete('invalid-id', 'provider-uuid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw when deleting document during under_review', async () => {
      documentRepo.findOne.mockResolvedValue({
        id: 'doc-uuid',
        verificationId: 'verification-uuid',
      } as VerificationDocument);
      verificationRepo.findOne.mockResolvedValue({
        id: 'verification-uuid',
        status: 'under_review',
      } as ProviderVerification);

      await expect(service.delete('doc-uuid', 'provider-uuid')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
