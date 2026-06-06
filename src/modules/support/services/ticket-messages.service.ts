import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TicketMessage } from '../../../entities/ticket-message.entity';
import { SupportTicket } from '../../../entities/support-ticket.entity';
import { TicketStatus } from '../enums/ticket-status.enum';

@Injectable()
export class TicketMessagesService {
  private readonly logger = new Logger(TicketMessagesService.name);

  constructor(
    @InjectRepository(TicketMessage)
    private readonly messageRepository: Repository<TicketMessage>,
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(
    ticketId: string,
    senderId: string,
    message: string,
  ): Promise<TicketMessage> {
    const ticket = await this.ticketRepository.findOne({
      where: { id: ticketId },
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    const allowedStatuses = [
      TicketStatus.OPEN,
      TicketStatus.IN_PROGRESS,
      TicketStatus.WAITING_FOR_USER,
    ];

    if (!allowedStatuses.includes(ticket.status)) {
      throw new BadRequestException(
        'Cannot add messages to a resolved or closed ticket',
      );
    }

    const msg = this.messageRepository.create({
      ticketId,
      senderId,
      message,
    });

    const saved = await this.messageRepository.save(msg);

    this.eventEmitter.emit('ticket.message_added', {
      ticketId,
      messageId: saved.id,
      senderId,
    });

    return saved;
  }

  async findByTicketId(ticketId: string): Promise<TicketMessage[]> {
    return this.messageRepository.find({
      where: { ticketId },
      order: { createdAt: 'ASC' },
    });
  }
}
