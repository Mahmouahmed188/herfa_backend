import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Dispute } from '../../../entities/dispute.entity';
import {
  DisputeStatus,
  DISPUTE_STATUS_TRANSITIONS,
} from '../enums/dispute-status.enum';
import { CreateDisputeDto } from '../dto/create-dispute.dto';
import { DisputeFilterDto } from '../dto/dispute-filter.dto';
import { ResolveDisputeDto } from '../dto/resolve-dispute.dto';
import { AuditService } from './audit.service';

@Injectable()
export class DisputesService {
  private readonly logger = new Logger(DisputesService.name);

  constructor(
    @InjectRepository(Dispute)
    private readonly disputeRepository: Repository<Dispute>,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateDisputeDto): Promise<Dispute> {
    const existingOpen = await this.disputeRepository.findOne({
      where: {
        bookingId: dto.bookingId,
        status: DisputeStatus.OPEN,
      },
    });

    if (existingOpen) {
      throw new BadRequestException(
        'A dispute for this booking is already open',
      );
    }

    const dispute = this.disputeRepository.create({
      bookingId: dto.bookingId,
      customerId: userId,
      providerId: '',
      title: dto.title,
      description: dto.description,
      status: DisputeStatus.OPEN,
    });

    const saved = await this.disputeRepository.save(dispute);

    this.eventEmitter.emit('dispute.opened', {
      disputeId: saved.id,
      bookingId: saved.bookingId,
      userId,
    });

    return saved;
  }

  async findById(id: string): Promise<Dispute> {
    const dispute = await this.disputeRepository.findOne({
      where: { id },
      relations: ['evidence'],
    });

    if (!dispute) {
      throw new NotFoundException('Dispute not found');
    }

    return dispute;
  }

  async findAll(
    userId: string,
    filter: DisputeFilterDto,
  ): Promise<{ data: Dispute[]; meta: any }> {
    const where: FindOptionsWhere<Dispute> = [
      { customerId: userId },
      { providerId: userId },
    ];
    this.applyFilter(where, filter);

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.disputeRepository.findAndCount({
      where: where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async findAllAdmin(
    filter: DisputeFilterDto,
  ): Promise<{ data: Dispute[]; meta: any }> {
    const where: FindOptionsWhere<Dispute> = {};
    this.applyFilter(where, filter);

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.disputeRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async updateStatus(
    disputeId: string,
    newStatus: DisputeStatus,
    adminId: string,
    adminRole: string,
  ): Promise<Dispute> {
    const dispute = await this.findById(disputeId);
    const oldStatus = dispute.status;

    const allowed = DISPUTE_STATUS_TRANSITIONS[oldStatus];
    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Invalid dispute status transition from ${oldStatus} to ${newStatus}`,
      );
    }

    dispute.status = newStatus;
    const saved = await this.disputeRepository.save(dispute);

    await this.auditService.log({
      action: 'dispute.status_changed',
      entityType: 'Dispute',
      entityId: disputeId,
      actorId: adminId,
      actorRole: adminRole,
      metadata: { oldStatus, newStatus },
    });

    return saved;
  }

  async resolve(
    disputeId: string,
    dto: ResolveDisputeDto,
    adminId: string,
    adminRole: string,
  ): Promise<Dispute> {
    const dispute = await this.findById(disputeId);

    const resolvableStatuses = [
      DisputeStatus.UNDER_REVIEW,
      DisputeStatus.AWAITING_EVIDENCE,
    ];

    if (!resolvableStatuses.includes(dispute.status)) {
      throw new BadRequestException(
        'Dispute must be under_review or awaiting_evidence to be resolved',
      );
    }

    const newStatus =
      dto.resolvedInFavorOf === 'customer'
        ? DisputeStatus.RESOLVED_CUSTOMER
        : DisputeStatus.RESOLVED_PROVIDER;

    const oldStatus = dispute.status;
    dispute.status = newStatus;
    dispute.resolution = dto.resolution;
    dispute.resolvedBy = adminId;
    dispute.resolvedAt = new Date();

    const saved = await this.disputeRepository.save(dispute);

    await this.auditService.log({
      action: 'dispute.resolved',
      entityType: 'Dispute',
      entityId: disputeId,
      actorId: adminId,
      actorRole: adminRole,
      metadata: {
        oldStatus,
        newStatus,
        resolution: dto.resolution,
        resolvedInFavorOf: dto.resolvedInFavorOf,
      },
    });

    this.eventEmitter.emit('dispute.resolved', {
      disputeId,
      bookingId: dispute.bookingId,
      resolvedInFavorOf: dto.resolvedInFavorOf,
    });

    return saved;
  }

  private applyFilter(
    where: FindOptionsWhere<Dispute>,
    filter: DisputeFilterDto,
  ): void {
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.bookingId) {
      where.bookingId = filter.bookingId;
    }
  }
}
