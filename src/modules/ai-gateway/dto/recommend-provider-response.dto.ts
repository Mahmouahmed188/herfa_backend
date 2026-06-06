import { ApiProperty } from '@nestjs/swagger';

class RecommendedProvider {
  @ApiProperty({ description: 'Provider ID', example: 'uuid-here' })
  providerId: string;

  @ApiProperty({
    description: 'Match score (0-1)',
    example: 0.92,
    minimum: 0,
    maximum: 1,
  })
  matchScore: number;

  @ApiProperty({
    description: 'Explanation of the recommendation',
    example: 'Specializes in pipe repair with 5 years experience',
  })
  explanation: string;
}

export class RecommendProviderResponseDto {
  @ApiProperty({
    description: 'List of recommended providers',
    type: [RecommendedProvider],
  })
  recommendedProviders: RecommendedProvider[];
}
