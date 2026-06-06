import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DisputeEvidence } from '../../../entities/dispute-evidence.entity';
import { Dispute } from '../../../entities/dispute.entity';
import {
  ALLOWED_EVIDENCE_FILE_TYPES,
  IMAGE_TYPES,
  IMAGE_MAX_SIZE,
  DOCUMENT_MAX_SIZE,
} from '../enums/evidence-file-type.enum';
import { AuditService } from './audit.service';
import * as path from 'path';

@Injectable()
export class DisputeEvidenceService {
  private readonly logger = new Logger(DisputeEvidenceService.name);

  constructor(
    @InjectRepository(DisputeEvidence)
    private readonly evidenceRepository: Repository<DisputeEvidence>,
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    disputeId: string,
    uploadedBy: string,
    file: Express.Multer.File,
    fileUrl: string,
  ): Promise<DisputeEvidence> {
    const dispute = await this.disputeRepository.findOne({
      where: { id: disputeId },
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');

    if (
      !ALLOWED_EVIDENCE_FILE_TYPES.includes(
        ext as (typeof ALLOWED_EVIDENCE_FILE_TYPES)[number],
      )
    ) {
      throw new BadRequestException(
        `File type .${ext} is not allowed. Allowed types: ${ALLOWED_EVIDENCE_FILE_TYPES.join(', ')}`,
      );
    }

    const isImage = IMAGE_TYPES.includes(ext as (typeof IMAGE_TYPES)[number]);
    const maxSize = isImage ? IMAGE_MAX_SIZE : DOCUMENT_MAX_SIZE;

    if (file.size > maxSize) {
      const sizeMB = Math.round(maxSize / (1024 * 1024));
      throw new BadRequestException(
        `File size exceeds the maximum allowed size of ${sizeMB}MB for ${isImage ? 'images' : 'documents'}`,
      );
    }

    const evidence = this.evidenceRepository.create({
      disputeId,
      uploadedBy,
      fileUrl,
      fileType: ext,
    });

    const saved = await this.evidenceRepository.save(evidence);

    await this.auditService.log({
      action: 'dispute.evidence_uploaded',
      entityType: 'DisputeEvidence',
      entityId: saved.id,
      actorId: uploadedBy,
      actorRole: 'user',
      metadata: {
        fileType: ext,
        fileUrl,
        disputeId,
      },
    });

    return saved;
  }

  async findByDisputeId(disputeId: string): Promise<DisputeEvidence[]> {
    return this.evidenceRepository.find({
      where: { disputeId },
      order: { uploadedAt: 'DESC' },
    });
  }
}
