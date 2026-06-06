import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from '../../../entities/support-ticket.entity';

@Injectable()
export class TicketOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      user?: { id: string; role: string };
      params?: { id?: string };
      ticket?: SupportTicket;
    }>();
    const user = request.user;
    const ticketId = request.params?.id;

    if (!ticketId || !user) {
      return true;
    }

    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      request.ticket = ticket;
      return true;
    }

    if (ticket.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this ticket');
    }

    request.ticket = ticket;
    return true;
  }
}
