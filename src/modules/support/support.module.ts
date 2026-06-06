import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportTicket } from '../../entities/support-ticket.entity';
import { TicketMessage } from '../../entities/ticket-message.entity';
import { Dispute } from '../../entities/dispute.entity';
import { DisputeEvidence } from '../../entities/dispute-evidence.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { SupportController } from './support.controller';
import { AdminSupportController } from './admin-support.controller';
import { TicketsService } from './services/tickets.service';
import { TicketMessagesService } from './services/ticket-messages.service';
import { DisputesService } from './services/disputes.service';
import { DisputeEvidenceService } from './services/dispute-evidence.service';
import { TicketNumberService } from './services/ticket-number.service';
import { AuditService } from './services/audit.service';
import { TicketOwnershipGuard } from './guards/ticket-ownership.guard';
import { DisputeParticipantGuard } from './guards/dispute-participant.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SupportTicket,
      TicketMessage,
      Dispute,
      DisputeEvidence,
      AuditLog,
    ]),
  ],
  controllers: [SupportController, AdminSupportController],
  providers: [
    TicketsService,
    TicketMessagesService,
    DisputesService,
    DisputeEvidenceService,
    TicketNumberService,
    AuditService,
    TicketOwnershipGuard,
    DisputeParticipantGuard,
  ],
  exports: [TicketsService, DisputesService],
})
export class SupportModule {}
