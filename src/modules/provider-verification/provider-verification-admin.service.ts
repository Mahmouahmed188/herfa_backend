import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ProviderVerification } from '../../entities/provider-verification.entity';
import { VerificationDocument } from '../../entities/verification-document.entity';
import { VerificationHistory } from '../../entities/verification-history.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { HistoryService } from './services/history.service';
import { AuditService } from './services/audit.service';
import { AdminVerificationFilterDto } from './dto/admin-verification-filter.dto';

const VALID_TRANSITIONS: Record<string, string[]> = {
  under_review: ['approved', 'rejected'],
  approved: ['suspended'],
  suspended: ['approved'],
};

@Injectable()
export class ProviderVerificationAdminService {
  constructor(
    @InjectRepository(ProviderVerification)
    private readonly verificationRepository: Repository<ProviderVerification>,
    @InjectRepository(VerificationDocument)
    private readonly documentRepository: Repository<VerificationDocument>,
    @InjectRepository(VerificationHistory)
    private readonly historyRepository: Repository<VerificationHistory>,
    @InjectRepository(ProviderProfile)
    private readonly profileRepository: Repository<ProviderProfile>,
    private readonly historyService: HistoryService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async findAll(filter: AdminVerificationFilterDto) {
    const qb = this.verificationRepository.createQueryBuilder('v');
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;
    const sortBy = filter.sortBy || 'submittedAt';
    const sortOrder = filter.sortOrder === 'asc' ? 'ASC' : 'DESC';

    if (filter.status) {
      qb.andWhere('v.status = :status', { status: filter.status });
    }

    if (filter.dateFrom) {
      qb.andWhere('v.submittedAt >= :dateFrom', {
        dateFrom: new Date(filter.dateFrom),
      });
    }

    if (filter.dateTo) {
      qb.andWhere('v.submittedAt <= :dateTo', {
        dateTo: new Date(filter.dateTo),
      });
    }

    const [verifications, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy(`v.${sortBy}`, sortOrder)
      .getManyAndCount();

    const data = await Promise.all(
      verifications.map(async (v) => {
        const profile = await this.profileRepository.findOne({
          where: { userId: v.providerId },
          relations: ['user'],
        });

        const docCount = await this.documentRepository.count({
          where: { verificationId: v.id },
        });

        return {
          id: v.id,
          providerId: v.providerId,
          providerName:
            profile?.businessName || profile?.user?.email || 'Unknown',
          providerEmail: profile?.user?.email || '',
          status: v.status,
          submittedAt: v.submittedAt,
          reviewedAt: v.reviewedAt,
          reviewedBy: v.reviewedBy,
          documentCount: docCount,
        };
      }),
    );

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const verification = await this.verificationRepository.findOne({
      where: { id },
    });

    if (!verification) {
      throw new NotFoundException('Verification record not found');
    }

    const profile = await this.profileRepository.findOne({
      where: { userId: verification.providerId },
      relations: ['user'],
    });

    const documents = await this.documentRepository.find({
      where: { verificationId: id },
      order: { uploadedAt: 'DESC' },
    });

    const history = await this.historyRepository.find({
      where: { verificationId: id },
      order: { createdAt: 'ASC' },
    });

    return {
      id: verification.id,
      provider: {
        id: profile?.id || '',
        businessName: profile?.businessName || '',
        email: profile?.user?.email || '',
        phone: profile?.user?.phone || '',
      },
      status: verification.status,
      submittedAt: verification.submittedAt,
      reviewedAt: verification.reviewedAt,
      reviewedBy: verification.reviewedBy,
      rejectionReason: verification.rejectionReason,
      suspensionReason: verification.suspensionReason,
      documents: documents.map((d) => ({
        id: d.id,
        documentType: d.documentType,
        documentUrl: d.documentUrl,
        originalName: d.originalName,
        mimeType: d.mimeType,
        fileSize: d.fileSize,
        uploadedAt: d.uploadedAt,
      })),
      history: history.map((h) => ({
        id: h.id,
        oldStatus: h.oldStatus,
        newStatus: h.newStatus,
        changedBy: h.changedBy,
        changedByRole: h.changedByRole,
        notes: h.notes,
        createdAt: h.createdAt,
      })),
    };
  }

  private async transitionStatus(
    id: string,
    newStatus: string,
    adminId: string,
    options: { reason?: string; notes?: string; requireReason?: boolean },
  ) {
    const verification = await this.verificationRepository.findOne({
      where: { id },
    });

    if (!verification) {
      throw new NotFoundException('Verification record not found');
    }

    const allowed = VALID_TRANSITIONS[verification.status];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from "${verification.status}" to "${newStatus}". Allowed transitions: ${(allowed || []).join(', ') || 'none'}`,
      );
    }

    if (options.requireReason && !options.reason) {
      throw new BadRequestException(
        `${newStatus === 'rejected' ? 'Rejection' : 'Suspension'} reason is required`,
      );
    }

    if (adminId === verification.providerId) {
      throw new BadRequestException(
        'Admins cannot perform actions on their own provider verification',
      );
    }

    const oldStatus = verification.status;
    verification.status = newStatus;

    if (newStatus === 'rejected') {
      (verification as any).rejectionReason = options.reason || null;
    }
    if (newStatus === 'suspended') {
      (verification as any).suspensionReason = options.reason || null;
    }
    if (newStatus === 'approved') {
      (verification as any).rejectionReason = null;
      (verification as any).suspensionReason = null;
    }

    verification.reviewedAt = new Date();
    verification.reviewedBy = adminId;

    const saved = await this.verificationRepository.save(verification);

    await this.historyService.recordChange({
      verificationId: saved.id,
      oldStatus,
      newStatus,
      changedBy: adminId,
      changedByRole: 'admin',
      notes: options.notes || `Verification ${newStatus} by admin`,
    });

    await this.auditService.log({
      action: `VERIFICATION_${newStatus.toUpperCase()}`,
      entityType: 'provider_verification',
      entityId: saved.id,
      actorId: adminId,
      actorRole: 'admin',
      metadata: {
        previousStatus: oldStatus,
        newStatus,
        reason: options.reason || null,
        notes: options.notes || null,
      },
    });

    await this.profileRepository.update(
      { userId: verification.providerId },
      { verificationStatus: newStatus },
    );

    const profile = await this.profileRepository.findOne({
      where: { userId: verification.providerId },
    });

    this.eventEmitter.emit(`verification.${newStatus}`, {
      event: `verification.${newStatus}`,
      timestamp: new Date().toISOString(),
      data: {
        verificationId: saved.id,
        providerId: verification.providerId,
        providerName: profile?.businessName || 'Provider',
        status: newStatus,
        reason: options.reason,
      },
    });

    return saved;
  }

  async approve(id: string, adminId: string, notes?: string) {
    return this.transitionStatus(id, 'approved', adminId, { notes });
  }

  async reject(id: string, adminId: string, reason: string, notes?: string) {
    return this.transitionStatus(id, 'rejected', adminId, {
      reason,
      notes,
      requireReason: true,
    });
  }

  async suspend(id: string, adminId: string, reason: string, notes?: string) {
    return this.transitionStatus(id, 'suspended', adminId, {
      reason,
      notes,
      requireReason: true,
    });
  }

  async reactivate(id: string, adminId: string, notes?: string) {
    return this.transitionStatus(id, 'approved', adminId, { notes });
  }
}
