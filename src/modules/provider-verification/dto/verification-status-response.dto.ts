import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class VerificationStatusResponseDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'under_review', enum: ['pending', 'under_review', 'approved', 'rejected', 'suspended'] })
  status: string;

  @ApiPropertyOptional({ example: '2026-06-05T10:00:00.000Z' })
  submittedAt: Date;

  @ApiPropertyOptional({ example: '2026-06-05T14:00:00.000Z' })
  reviewedAt: Date;

  @ApiPropertyOptional({ example: 'uuid' })
  reviewedBy: string;

  @ApiPropertyOptional({ example: 'National ID is blurry' })
  rejectionReason: string;

  @ApiPropertyOptional({ example: 'Multiple customer complaints' })
  suspensionReason: string;
}
