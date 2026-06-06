import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeImageResponseDto {
  @ApiProperty({
    description: 'Identified problem type',
    example: 'water_leak',
  })
  problemType: string;

  @ApiProperty({
    description: 'Service category',
    example: 'plumbing',
  })
  serviceCategory: string;

  @ApiProperty({
    description: 'Confidence score (0-1)',
    example: 0.88,
    minimum: 0,
    maximum: 1,
  })
  confidenceScore: number;

  @ApiProperty({
    description: 'Recommendations based on analysis',
    example: ['Plumber inspection recommended', 'Check pipe joints for corrosion'],
  })
  recommendations: string[];
}
