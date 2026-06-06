import { ApiProperty } from '@nestjs/swagger';

class CostRange {
  @ApiProperty({ example: 80 })
  min: number;

  @ApiProperty({ example: 150 })
  max: number;
}

export class EstimateCostResponseDto {
  @ApiProperty({
    description: 'Estimated cost range',
  })
  estimatedCostRange: CostRange;

  @ApiProperty({
    description: 'Estimated duration',
    example: '1-2 hours',
  })
  estimatedDuration: string;

  @ApiProperty({
    description: 'Confidence score (0-1)',
    example: 0.85,
    minimum: 0,
    maximum: 1,
  })
  confidenceScore: number;
}
