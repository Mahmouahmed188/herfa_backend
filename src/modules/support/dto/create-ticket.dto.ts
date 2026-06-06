import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TicketCategory } from '../enums/ticket-category.enum';

export class CreateTicketDto {
  @ApiProperty({
    description: 'Ticket subject',
    example: 'Payment not processed',
  })
  @IsNotEmpty()
  @IsString()
  subject: string;

  @ApiProperty({
    description: 'Detailed description',
    example: 'I paid via card but the booking still shows unpaid.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Ticket category',
    enum: TicketCategory,
    example: TicketCategory.PAYMENT,
  })
  @IsNotEmpty()
  @IsEnum(TicketCategory)
  category: TicketCategory;

  @ApiPropertyOptional({ description: 'Related booking ID' })
  @IsOptional()
  @IsUUID()
  bookingId?: string;
}
