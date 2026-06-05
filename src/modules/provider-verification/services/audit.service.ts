import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../../../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(params: {
    action: string;
    entityType: string;
    entityId: string;
    actorId: string;
    actorRole: string;
    metadata?: Record<string, any>;
  }): Promise<AuditLog> {
    const entry = this.auditLogRepository.create({
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      actorId: params.actorId,
      actorRole: params.actorRole,
      metadata: params.metadata ?? undefined,
    } as any);
    return this.auditLogRepository.save(entry) as unknown as AuditLog;
  }
}
