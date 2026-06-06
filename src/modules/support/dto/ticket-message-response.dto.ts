import { ApiProperty } from '@nestjs/swagger';

export class TicketMessageResponseDto {
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
