import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TicketStatus } from '../enums/ticket-status.enum';

export class UpdateTicketStatusDto {
  @ApiProperty({
    description: 'New ticket status',
    enum: TicketStatus,
    example: TicketStatus.IN_PROGRESS,
  })
  @IsNotEmpty()
  @IsEnum(TicketStatus)
  status: TicketStatus;
}
