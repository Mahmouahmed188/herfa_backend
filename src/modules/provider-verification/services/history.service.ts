import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VerificationHistory } from '../../../entities/verification-history.entity';

@Injectable()
export class HistoryService {
  constructor(
    @InjectRepository(VerificationHistory)
    private readonly historyRepository: Repository<VerificationHistory>,
  ) {}

  async recordChange(params: {
    verificationId: string;
    oldStatus: string | null;
    newStatus: string;
    changedBy: string;
    changedByRole: string;
    notes?: string;
  }): Promise<VerificationHistory> {
    const entry = this.historyRepository.create({
      verificationId: params.verificationId,
      oldStatus: params.oldStatus,
      newStatus: params.newStatus,
      changedBy: params.changedBy,
      changedByRole: params.changedByRole,
      notes: params.notes || null,
    } as any);

    return this.historyRepository.save(entry) as unknown as VerificationHistory;
  }

  async findByVerificationId(verificationId: string): Promise<VerificationHistory[]> {
    return this.historyRepository.find({
      where: { verificationId },
      order: { createdAt: 'ASC' },
    });
  }
}
