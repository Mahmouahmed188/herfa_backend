import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsService } from '../notifications.service';
import { NotificationType } from '../../../common/constants/user.enums';

interface TicketCreatedPayload {
  ticketId: string;
  ticketNumber: string;
  userId: string;
  category: string;
}

interface TicketUpdatedPayload {
  ticketId: string;
  userId?: string;
  oldStatus: string;
  newStatus: string;
}

interface TicketMessageAddedPayload {
  ticketId: string;
  messageId: string;
  senderId: string;
  userId?: string;
}

interface TicketClosedPayload {
  ticketId: string;
  userId?: string;
}

interface DisputeOpenedPayload {
  disputeId: string;
  bookingId: string;
  userId: string;
}

interface DisputeResolvedPayload {
  disputeId: string;
  bookingId: string;
  resolvedInFavorOf: string;
  userId?: string;
}

@Injectable()
export class SupportEventsHandler {
  private readonly logger = new Logger(SupportEventsHandler.name);

  constructor(private readonly notificationsService: NotificationsService) {}

  @OnEvent('ticket.created')
  async handleTicketCreated(payload: TicketCreatedPayload) {
    await this.notificationsService.create({
      userId: payload.userId,
      type: NotificationType.TICKET_CREATED,
      title: 'Support Ticket Created',
      message: `Your support ticket ${payload.ticketNumber} has been created successfully.`,
      relatedEntityType: 'SupportTicket',
      relatedEntityId: payload.ticketId,
    });
    this.logger.log(
      `Ticket created notification sent to user ${payload.userId}`,
    );
  }

  @OnEvent('ticket.updated')
  async handleTicketUpdated(payload: TicketUpdatedPayload) {
    await this.notificationsService.create({
      userId: payload.userId ?? '',
      type: NotificationType.TICKET_UPDATED,
      title: 'Ticket Status Updated',
      message: `Your ticket status has changed from ${payload.oldStatus} to ${payload.newStatus}.`,
      relatedEntityType: 'SupportTicket',
      relatedEntityId: payload.ticketId,
    });
  }

  @OnEvent('ticket.message_added')
  async handleTicketMessageAdded(payload: TicketMessageAddedPayload) {
    await this.notificationsService.create({
      userId: payload.userId ?? '',
      type: NotificationType.TICKET_MESSAGE,
      title: 'New Message on Ticket',
      message: 'A new message has been added to your support ticket.',
      relatedEntityType: 'SupportTicket',
      relatedEntityId: payload.ticketId,
    });
  }

  @OnEvent('ticket.closed')
  async handleTicketClosed(payload: TicketClosedPayload) {
    await this.notificationsService.create({
      userId: payload.userId ?? '',
      type: NotificationType.TICKET_CLOSED,
      title: 'Ticket Closed',
      message: 'Your support ticket has been closed.',
      relatedEntityType: 'SupportTicket',
      relatedEntityId: payload.ticketId,
    });
  }

  @OnEvent('dispute.opened')
  async handleDisputeOpened(payload: DisputeOpenedPayload) {
    await this.notificationsService.create({
      userId: payload.userId,
      type: NotificationType.DISPUTE_OPENED,
      title: 'Dispute Opened',
      message: 'A dispute has been opened. An admin will review it shortly.',
      relatedEntityType: 'Dispute',
      relatedEntityId: payload.disputeId,
    });
  }

  @OnEvent('dispute.resolved')
  async handleDisputeResolved(payload: DisputeResolvedPayload) {
    await this.notificationsService.create({
      userId: payload.userId ?? '',
      type: NotificationType.DISPUTE_RESOLVED,
      title: 'Dispute Resolved',
      message: `The dispute has been resolved in favor of the ${payload.resolvedInFavorOf}.`,
      relatedEntityType: 'Dispute',
      relatedEntityId: payload.disputeId,
    });
  }
}
