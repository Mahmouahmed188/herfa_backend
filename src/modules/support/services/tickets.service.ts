import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, Like } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SupportTicket } from '../../../entities/support-ticket.entity';
import { TicketStatus } from '../enums/ticket-status.enum';
import { TicketPriority } from '../enums/ticket-priority.enum';
import { CreateTicketDto } from '../dto/create-ticket.dto';
import { TicketFilterDto } from '../dto/ticket-filter.dto';
import { TicketNumberService } from './ticket-number.service';
import { AuditService } from './audit.service';
import { isValidTicketTransition } from '../enums/ticket-status-transitions';

@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(
    @InjectRepository(SupportTicket)
    private readonly ticketRepository: Repository<SupportTicket>,
    private readonly ticketNumberService: TicketNumberService,
    private readonly auditService: AuditService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateTicketDto): Promise<SupportTicket> {
    const ticketNumber =
      await this.ticketNumberService.generateUniqueTicketNumber();

    const ticket = this.ticketRepository.create({
      userId,
      ticketNumber,
      category: dto.category,
      subject: dto.subject,
      description: dto.description,
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
    });

    const saved = await this.ticketRepository.save(ticket);

    this.eventEmitter.emit('ticket.created', {
      ticketId: saved.id,
      ticketNumber: saved.ticketNumber,
      userId: saved.userId,
      category: saved.category,
    });

    return saved;
  }

  async findById(id: string): Promise<SupportTicket> {
    const ticket = await this.ticketRepository.findOne({
      where: { id },
      relations: ['messages', 'messages.sender'],
    });

    if (!ticket) {
      throw new NotFoundException('Ticket not found');
    }

    return ticket;
  }

  async findAll(
    userId: string,
    filter: TicketFilterDto,
  ): Promise<{ data: SupportTicket[]; meta: any }> {
    const where: FindOptionsWhere<SupportTicket> = { userId };
    this.applyFilter(where, filter);

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.ticketRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findAllAdmin(
    filter: TicketFilterDto,
  ): Promise<{ data: SupportTicket[]; meta: any }> {
    const where: FindOptionsWhere<SupportTicket> = {};
    this.applyFilter(where, filter);

    const page = filter.page || 1;
    const limit = filter.limit || 20;
    const skip = (page - 1) * limit;

    const [data, total] = await this.ticketRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateStatus(
    ticketId: string,
    newStatus: TicketStatus,
    adminId: string,
    adminRole: string,
  ): Promise<SupportTicket> {
    const ticket = await this.findById(ticketId);

    if (!isValidTicketTransition(ticket.status, newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${ticket.status} to ${newStatus}`,
      );
    }

    const oldStatus = ticket.status;
    ticket.status = newStatus;
    const saved = await this.ticketRepository.save(ticket);

    await this.auditService.log({
      action: 'ticket.status_changed',
      entityType: 'SupportTicket',
      entityId: ticketId,
      actorId: adminId,
      actorRole: adminRole,
      metadata: { oldStatus, newStatus },
    });

    this.eventEmitter.emit('ticket.updated', {
      ticketId,
      oldStatus,
      newStatus,
    });

    if (newStatus === TicketStatus.CLOSED) {
      this.eventEmitter.emit('ticket.closed', { ticketId });
    }

    return saved;
  }

  async updatePriority(
    ticketId: string,
    priority: TicketPriority,
    adminId: string,
    adminRole: string,
  ): Promise<SupportTicket> {
    const ticket = await this.findById(ticketId);
    const oldPriority = ticket.priority;
    ticket.priority = priority;
    const saved = await this.ticketRepository.save(ticket);

    await this.auditService.log({
      action: 'ticket.priority_changed',
      entityType: 'SupportTicket',
      entityId: ticketId,
      actorId: adminId,
      actorRole: adminRole,
      metadata: { oldPriority, newPriority: priority },
    });

    return saved;
  }

  async assignAdmin(ticketId: string, adminId: string): Promise<SupportTicket> {
    const ticket = await this.findById(ticketId);
    ticket.assignedAdminId = adminId;
    return this.ticketRepository.save(ticket);
  }

  private applyFilter(
    where: FindOptionsWhere<SupportTicket>,
    filter: TicketFilterDto,
  ): void {
    if (filter.status) {
      where.status = filter.status;
    }
    if (filter.category) {
      where.category = filter.category;
    }
    if (filter.priority) {
      where.priority = filter.priority;
    }
    if (filter.userId) {
      where.userId = filter.userId;
    }
    if (filter.search) {
      where.subject = Like(`%${filter.search}%`);
    }
  }
}
