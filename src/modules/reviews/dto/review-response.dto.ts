import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty({ description: 'Review ID' })
  id: string;

  @ApiProperty({ description: 'Booking ID' })
  bookingId: string;

  @ApiProperty({ description: 'Customer ID' })
  customerId: string;

  @ApiProperty({ description: 'Customer name' })
  customerName: string;

  @ApiPropertyOptional({ description: 'Customer avatar URL' })
  customerAvatar?: string;

  @ApiProperty({ description: 'Provider ID' })
  providerId: string;

  @ApiProperty({ description: 'Rating 1-5' })
  rating: number;

  @ApiPropertyOptional({ description: 'Review comment' })
  comment?: string;

  @ApiProperty({ description: 'Whether review is editable' })
  isEditable: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
