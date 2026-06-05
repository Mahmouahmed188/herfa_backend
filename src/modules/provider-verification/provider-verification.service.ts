import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProviderVerification } from '../../entities/provider-verification.entity';
import { VerificationDocument } from '../../entities/verification-document.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { HistoryService } from './services/history.service';
import { AuditService } from './services/audit.service';

@Injectable()
export class ProviderVerificationService {
  constructor(
    @InjectRepository(ProviderVerification)
    private readonly verificationRepository: Repository<ProviderVerification>,
    @InjectRepository(VerificationDocument)
    private readonly documentRepository: Repository<VerificationDocument>,
    @InjectRepository(ProviderProfile)
    private readonly profileRepository: Repository<ProviderProfile>,
    private readonly historyService: HistoryService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async submit(providerId: string, notes?: string): Promise<ProviderVerification> {
    const profile = await this.profileRepository.findOne({
      where: { userId: providerId },
    });

    if (!profile) {
      throw new NotFoundException('Provider profile not found');
    }

    let verification = await this.verificationRepository.findOne({
      where: { providerId },
    });

    if (!verification) {
      verification = this.verificationRepository.create({
        providerId,
        status: 'pending',
      });
      verification = await this.verificationRepository.save(verification);
    }

    if (verification.status === 'under_review') {
      throw new BadRequestException('Verification already submitted. Your application is currently under review.');
    }

    if (verification.status === 'approved') {
      throw new BadRequestException('Your account is already verified.');
    }

    if (verification.status === 'suspended') {
      throw new BadRequestException('Your account is suspended. Please contact support.');
    }

    const docCount = await this.documentRepository.count({
      where: { verificationId: verification.id },
    });

    if (docCount === 0) {
      throw new BadRequestException('Required documents not uploaded. Please upload at least one identity document.');
    }

    const oldStatus = verification.status;
    verification.status = 'under_review';
    verification.submittedAt = new Date();
    (verification as any).reviewedAt = null;
    (verification as any).reviewedBy = null;
    (verification as any).rejectionReason = null;
    (verification as any).suspensionReason = null;

    const saved = await this.verificationRepository.save(verification);

    await this.historyService.recordChange({
      verificationId: saved.id,
      oldStatus,
      newStatus: 'under_review',
      changedBy: providerId,
      changedByRole: 'provider',
      notes: notes || 'Provider submitted verification',
    });

    await this.auditService.log({
      action: 'VERIFICATION_SUBMITTED',
      entityType: 'provider_verification',
      entityId: saved.id,
      actorId: providerId,
      actorRole: 'provider',
      metadata: { previousStatus: oldStatus, newStatus: 'under_review' },
    });

    this.eventEmitter.emit('verification.submitted', {
      event: 'verification.submitted',
      timestamp: new Date().toISOString(),
      data: {
        verificationId: saved.id,
        providerId,
        providerName: profile.businessName || 'Provider',
        status: 'under_review',
      },
    });

    return saved;
  }

  async getStatus(providerId: string): Promise<ProviderVerification> {
    const verification = await this.verificationRepository.findOne({
      where: { providerId },
    });

    if (!verification) {
      throw new NotFoundException('No verification record found');
    }

    return verification;
  }

  async findByProviderId(providerId: string): Promise<ProviderVerification> {
    const verification = await this.verificationRepository.findOne({
      where: { providerId },
    });

    if (!verification) {
      throw new NotFoundException('No verification record found');
    }

    return verification;
  }

  async findById(id: string): Promise<ProviderVerification> {
    const verification = await this.verificationRepository.findOne({
      where: { id },
    });

    if (!verification) {
      throw new NotFoundException('Verification record not found');
    }

    return verification;
  }
}
