import { TicketStatus } from './ticket-status.enum';

export const TICKET_STATUS_TRANSITIONS: Record<TicketStatus, TicketStatus[]> = {
  [TicketStatus.OPEN]: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
  ],
  [TicketStatus.IN_PROGRESS]: [
    TicketStatus.WAITING_FOR_USER,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
  ],
  [TicketStatus.WAITING_FOR_USER]: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
    TicketStatus.CLOSED,
  ],
  [TicketStatus.RESOLVED]: [TicketStatus.CLOSED],
  [TicketStatus.CLOSED]: [],
};

export function isValidTicketTransition(
  from: TicketStatus,
  to: TicketStatus,
): boolean {
  const allowed = TICKET_STATUS_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
