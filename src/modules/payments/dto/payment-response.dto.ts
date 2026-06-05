import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class BookingRef {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'BK-001' })
  bookingNumber: string;
}

class UserRef {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'John Doe' })
  name: string;
}

export class PaymentResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'PAY-20260605-A3F9K2' })
  paymentNumber: string;

  @ApiProperty({ example: 250.0 })
  amount: number;

  @ApiProperty({ example: 'EGP' })
  currency: string;

  @ApiProperty({ example: 'credit_card' })
  paymentMethod: string;

  @ApiProperty({ example: 'paid' })
  paymentStatus: string;

  @ApiPropertyOptional({ example: 'txn_abc123' })
  transactionReference: string;

  @ApiProperty({ type: BookingRef })
  booking: BookingRef;

  @ApiProperty({ type: UserRef })
  customer: UserRef;

  @ApiProperty({ type: UserRef })
  provider: UserRef;

  @ApiPropertyOptional({ example: 'Payment completed successfully' })
  notes: string;

  @ApiPropertyOptional({ example: '2026-06-05T10:30:00Z' })
  paidAt: Date;

  @ApiProperty({ example: '2026-06-05T10:30:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-06-05T10:30:00Z' })
  updatedAt: Date;
}

export class PaginatedPaymentResponseDto {
  @ApiProperty({ type: [PaymentResponseDto] })
  data: PaymentResponseDto[];

  @ApiProperty({
    example: { page: 1, limit: 20, total: 42, totalPages: 3 },
  })
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
