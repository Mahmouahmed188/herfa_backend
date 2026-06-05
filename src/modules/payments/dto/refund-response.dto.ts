import { ApiProperty } from '@nestjs/swagger';

export class RefundResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  paymentId: string;

  @ApiProperty({ example: 50.0 })
  refundAmount: number;

  @ApiProperty({ example: 'Customer requested partial refund' })
  refundReason: string;

  @ApiProperty({ example: 'uuid' })
  refundedBy: string;

  @ApiProperty({ example: '2026-06-05T11:30:00Z' })
  refundedAt: Date;

  @ApiProperty({ example: '2026-06-05T11:30:00Z' })
  createdAt: Date;
}
