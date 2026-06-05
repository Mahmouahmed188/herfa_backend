import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Refund } from '../../entities/refund.entity';

@Injectable()
export class RefundsService {
  constructor(
    @InjectRepository(Refund)
    private readonly refundRepository: Repository<Refund>,
  ) {}

  async createRefund(params: {
    paymentId: string;
    refundAmount: number;
    refundReason: string;
    refundedBy: string;
  }): Promise<Refund> {
    const refund = this.refundRepository.create({
      paymentId: params.paymentId,
      refundAmount: params.refundAmount,
      refundReason: params.refundReason,
      refundedBy: params.refundedBy,
    });

    return this.refundRepository.save(refund);
  }

  async getRefundsByPayment(paymentId: string): Promise<Refund[]> {
    return this.refundRepository.find({
      where: { paymentId },
      order: { createdAt: 'DESC' },
    });
  }
}
