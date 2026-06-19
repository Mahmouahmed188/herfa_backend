import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProviderOnboardingStatusDto {
  @ApiProperty({
    description: 'Current verification status',
    example: 'UNVERIFIED',
    enum: ['UNVERIFIED', 'PENDING', 'APPROVED', 'REJECTED'],
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Timestamp when the verification was submitted',
    example: '2026-06-19T10:00:00.000Z',
    nullable: true,
  })
  submittedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Timestamp when the verification was reviewed by admin',
    example: '2026-06-20T14:30:00.000Z',
    nullable: true,
  })
  reviewedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Admin note or rejection reason',
    example: 'Please upload a clearer image of your national ID',
    nullable: true,
  })
  adminNote: string | null;
}

export class ProviderOnboardingSubmitResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'PENDING' })
  status: string;

  @ApiProperty({ example: 'Verification request submitted successfully' })
  message: string;
}
