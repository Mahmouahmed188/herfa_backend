import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketCategory } from '../enums/ticket-category.enum';
import { TicketStatus } from '../enums/ticket-status.enum';
import { TicketPriority } from '../enums/ticket-priority.enum';

class TicketMessageInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ticketId: string;

  @ApiProperty()
  senderId: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  createdAt: Date;
}

export class TicketResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ticketNumber: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: TicketCategory })
  category: TicketCategory;

  @ApiProperty({ enum: TicketPriority })
  priority: TicketPriority;

  @ApiProperty({ enum: TicketStatus })
  status: TicketStatus;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  assignedAdminId: string;

  @ApiPropertyOptional({ type: [TicketMessageInfo] })
  messages?: TicketMessageInfo[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedTicketResponseDto {
  @ApiProperty({ isArray: true, type: TicketResponseDto })
  data: TicketResponseDto[];

  @ApiProperty()
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
