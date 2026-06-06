import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from '../../../entities/support-ticket.entity';
import { Dispute } from '../../../entities/dispute.entity';
import { TicketStatus } from '../../../modules/support/enums/ticket-status.enum';
import { DisputeStatus } from '../../../modules/support/enums/dispute-status.enum';
import { DateRangeFilterService } from './date-range-filter.service';
import { DateRangePreset } from '../dto/date-range-filter.dto';
import { SupportAnalyticsDto } from '../dto/support-analytics.dto';

@Injectable()
export class SupportAnalyticsService {
  constructor(
    @InjectRepository(SupportTicket)
    private supportTicketRepository: Repository<SupportTicket>,
    @InjectRepository(Dispute)
    private disputeRepository: Repository<Dispute>,
    private dateRangeFilterService: DateRangeFilterService,
  ) {}

  async getAnalytics(
    preset?: DateRangePreset,
    startDate?: string,
    endDate?: string,
  ): Promise<SupportAnalyticsDto> {
    const range = this.dateRangeFilterService.resolve(preset, startDate, endDate);

    const openTickets = await this.supportTicketRepository.count({
      where: { status: TicketStatus.OPEN },
    });

    const resolvedTickets = await this.supportTicketRepository.count({
      where: { status: TicketStatus.RESOLVED },
    });

    const avgResolutionResult = await this.supportTicketRepository
      .createQueryBuilder('ticket')
      .select('COALESCE(AVG(EXTRACT(EPOCH FROM (ticket.updatedAt - ticket.createdAt)) / 3600), 0)', 'averageHours')
      .where('ticket.status = :status', { status: TicketStatus.RESOLVED })
      .andWhere('ticket.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .getRawOne<{ averageHours: string }>();

    const activeDisputes = await this.disputeRepository.count({
      where: { status: DisputeStatus.OPEN },
    });

    const disputeResolutionResult = await this.disputeRepository
      .createQueryBuilder('dispute')
      .select('COUNT(*)', 'total')
      .addSelect("COUNT(CASE WHEN dispute.status = 'resolved' THEN 1 END)", 'resolved')
      .where('dispute.createdAt BETWEEN :start AND :end', {
        start: range.startDate,
        end: range.endDate,
      })
      .getRawOne<{ total: string; resolved: string }>();

    const totalDisputes = parseInt(disputeResolutionResult?.total || '0');
    const resolvedDisputes = parseInt(disputeResolutionResult?.resolved || '0');

    return {
      openTickets,
      resolvedTickets,
      averageResolutionHours: Number(avgResolutionResult?.averageHours || 0),
      activeDisputes,
      disputeResolutionRate: totalDisputes > 0
        ? Number(((resolvedDisputes / totalDisputes) * 100).toFixed(1))
        : 0,
    };
  }
}
