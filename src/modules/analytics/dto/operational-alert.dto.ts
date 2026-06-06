import { ApiProperty } from '@nestjs/swagger';

export class OperationalAlertDto {
  @ApiProperty({ example: 'high_booking_failure' })
  alertType: string;

  @ApiProperty({ example: 'warning' })
  severity: string;

  @ApiProperty({ example: 'Booking failure rate exceeded 10% threshold' })
  message: string;

  @ApiProperty({ example: 'booking', nullable: true })
  relatedEntity: string;

  @ApiProperty({ example: '2026-06-06T10:00:00Z' })
  timestamp: Date;
}
