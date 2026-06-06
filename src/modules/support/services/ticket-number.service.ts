import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SupportTicket } from '../../../entities/support-ticket.entity';
import * as crypto from 'crypto';

@Injectable()
export class TicketNumberService {
  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
  ) {}

  async generateUniqueTicketNumber(): Promise<string> {
    let ticketNumber: string;
    let exists = true;

    while (exists) {
      const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
      ticketNumber = `TKT-${randomPart}`;
      const existing = await this.ticketRepository.findOne({
        where: { ticketNumber },
      });
      exists = !!existing;
    }

    return ticketNumber;
  }
}
