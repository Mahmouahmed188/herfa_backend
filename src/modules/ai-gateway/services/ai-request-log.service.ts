import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiRequestLog } from '../../../entities/ai-request-log.entity';

@Injectable()
export class AiRequestLogService {
  constructor(
    @InjectRepository(AiRequestLog)
    private readonly logRepo: Repository<AiRequestLog>,
  ) {}

  async createLog(dto: Partial<AiRequestLog>): Promise<AiRequestLog> {
    const log = this.logRepo.create(dto);
    return this.logRepo.save(log);
  }

  async updateLog(
    id: string,
    updates: Partial<AiRequestLog>,
  ): Promise<AiRequestLog | null> {
    await this.logRepo.update(id, updates);
    return this.logRepo.findOne({ where: { id } });
  }

  async queryLogs(filters: {
    userId?: string;
    featureType?: string;
    status?: string;
    fromDate?: Date;
    toDate?: Date;
  }): Promise<AiRequestLog[]> {
    const query = this.logRepo.createQueryBuilder('log');

    if (filters.userId) {
      query.andWhere('log.userId = :userId', { userId: filters.userId });
    }
    if (filters.featureType) {
      query.andWhere('log.featureType = :featureType', {
        featureType: filters.featureType,
      });
    }
    if (filters.status) {
      query.andWhere('log.status = :status', { status: filters.status });
    }
    if (filters.fromDate) {
      query.andWhere('log.createdAt >= :fromDate', {
        fromDate: filters.fromDate,
      });
    }
    if (filters.toDate) {
      query.andWhere('log.createdAt <= :toDate', {
        toDate: filters.toDate,
      });
    }

    return query.orderBy('log.createdAt', 'DESC').getMany();
  }
}
