import { ApiProperty } from '@nestjs/swagger';

export class OcrResponseDto {
  @ApiProperty({
    description: 'Extracted document data',
    example: {
      fullName: 'John Doe',
      documentNumber: 'AB123456',
      dateOfBirth: '1990-01-15',
      nationality: 'JO',
    },
  })
  extractedData: Record<string, any>;

  @ApiProperty({
    description: 'Validation status',
    enum: ['verified', 'suspected_fraud', 'unclear'],
    example: 'verified',
  })
  validationStatus: string;

  @ApiProperty({
    description: 'Confidence score (0-1)',
    example: 0.96,
    minimum: 0,
    maximum: 1,
  })
  confidenceScore: number;
}
