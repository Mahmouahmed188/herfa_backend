import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  VerificationDocument,
  DocumentType,
} from '../../../entities/verification-document.entity';
import { ProviderVerification } from '../../../entities/provider-verification.entity';
import { LocalStorageProvider } from './local-storage-provider.service';
import { AuditService } from './audit.service';

@Injectable()
export class DocumentService {
  constructor(
    @InjectRepository(VerificationDocument)
    private readonly documentRepository: Repository<VerificationDocument>,
    @InjectRepository(ProviderVerification)
    private readonly verificationRepository: Repository<ProviderVerification>,
    private readonly storageProvider: LocalStorageProvider,
    private readonly auditService: AuditService,
  ) {}

  async upload(
    file: Express.Multer.File,
    documentType: DocumentType,
    providerId: string,
  ): Promise<VerificationDocument> {
    let verification = await this.verificationRepository.findOne({
      where: { providerId },
    });

    if (verification && verification.status !== 'pending') {
      throw new BadRequestException(
        'Cannot modify documents while verification is in progress',
      );
    }

    if (!verification) {
      verification = this.verificationRepository.create({
        providerId,
        status: 'pending',
      });
      verification = await this.verificationRepository.save(verification);
    }

    const documentUrl = await this.storageProvider.upload(file);

    const document = this.documentRepository.create({
      verificationId: verification.id,
      documentType,
      documentUrl,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
    });

    const saved = await this.documentRepository.save(document);

    await this.auditService.log({
      action: 'DOCUMENT_UPLOADED',
      entityType: 'verification_document',
      entityId: saved.id,
      actorId: providerId,
      actorRole: 'provider',
      metadata: { documentType, fileSize: file.size },
    });

    return saved;
  }

  async findByProviderId(providerId: string): Promise<VerificationDocument[]> {
    const verification = await this.verificationRepository.findOne({
      where: { providerId },
    });

    if (!verification) {
      return [];
    }

    return this.documentRepository.find({
      where: { verificationId: verification.id },
      order: { uploadedAt: 'DESC' },
    });
  }

  async findByVerificationId(
    verificationId: string,
  ): Promise<VerificationDocument[]> {
    return this.documentRepository.find({
      where: { verificationId },
      order: { uploadedAt: 'DESC' },
    });
  }

  async delete(documentId: string, providerId: string): Promise<void> {
    const document = await this.documentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    const verification = await this.verificationRepository.findOne({
      where: { id: document.verificationId },
    });

    if (verification && verification.status !== 'pending') {
      throw new BadRequestException(
        'Cannot delete documents while verification is in progress',
      );
    }

    await this.storageProvider.delete(document.documentUrl);
    await this.documentRepository.remove(document);

    await this.auditService.log({
      action: 'DOCUMENT_DELETED',
      entityType: 'verification_document',
      entityId: document.id,
      actorId: providerId,
      actorRole: 'provider',
      metadata: { documentType: document.documentType },
    });
  }
}
