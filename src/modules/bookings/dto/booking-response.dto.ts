import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class StatusHistoryEntry {
  @ApiProperty()
  id: string;

  @ApiProperty()
  oldStatus: string;

  @ApiProperty()
  newStatus: string;

  @ApiProperty()
  changedBy: string;

  @ApiProperty()
  createdAt: Date;
}

class CustomerInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

class ProviderInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

class ServiceInfo {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;
}

export class BookingResponseDto {
  @ApiProperty({ description: 'Booking ID' })
  id: string;

  @ApiProperty({
    description: 'Unique booking number',
    example: 'BKG-A1B2C3D4',
  })
  bookingNumber: string;

  @ApiProperty({ description: 'Current status' })
  status: string;

  @ApiProperty({ description: 'Customer information' })
  customer: CustomerInfo;

  @ApiProperty({ description: 'Provider information' })
  provider: ProviderInfo;

  @ApiProperty({ description: 'Service information' })
  service: ServiceInfo;

  @ApiProperty({ description: 'Address line' })
  addressLine: string;

  @ApiProperty({ description: 'City' })
  city: string;

  @ApiPropertyOptional()
  latitude?: number;

  @ApiPropertyOptional()
  longitude?: number;

  @ApiProperty({ description: 'Scheduled date' })
  scheduledDate: string;

  @ApiProperty({ description: 'Scheduled time' })
  scheduledTime: string;

  @ApiPropertyOptional({ description: 'Notes' })
  notes?: string;

  @ApiPropertyOptional({ description: 'Completion timestamp' })
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Cancellation timestamp' })
  cancelledAt?: Date;

  @ApiPropertyOptional({ description: 'Cancellation reason' })
  cancellationReason?: string;

  @ApiProperty({ description: 'Status history audit trail' })
  statusHistory: StatusHistoryEntry[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PaginatedResponseDto {
  @ApiProperty({ description: 'Array of items' })
  items: BookingResponseDto[];

  @ApiProperty({ description: 'Total number of items' })
  total: number;

  @ApiProperty({ description: 'Current page number' })
  page: number;

  @ApiProperty({ description: 'Items per page' })
  limit: number;

  @ApiProperty({ description: 'Total number of pages' })
  totalPages: number;
}
