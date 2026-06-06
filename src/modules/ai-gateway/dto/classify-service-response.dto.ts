import { ApiProperty } from '@nestjs/swagger';

export class ClassifyServiceResponseDto {
  @ApiProperty({
    description: 'Service category',
    example: 'plumbing',
  })
  category: string;

  @ApiProperty({
    description: 'Suggested service name',
    example: 'Faucet Repair',
  })
  suggestedService: string;

  @ApiProperty({
    description: 'Confidence score (0-1)',
    example: 0.95,
    minimum: 0,
    maximum: 1,
  })
  confidenceScore: number;
}
