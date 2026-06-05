import { ApiProperty } from '@nestjs/swagger';

export class ProviderRatingStatsResponseDto {
  @ApiProperty({ description: 'Provider ID' })
  providerId: string;

  @ApiProperty({ description: 'Average rating (1.00-5.00)', example: 4.5 })
  averageRating: number;

  @ApiProperty({ description: 'Total number of reviews', example: 42 })
  totalReviews: number;

  @ApiProperty({ description: 'Number of 5-star reviews', example: 25 })
  fiveStarCount: number;

  @ApiProperty({ description: 'Number of 4-star reviews', example: 10 })
  fourStarCount: number;

  @ApiProperty({ description: 'Number of 3-star reviews', example: 5 })
  threeStarCount: number;

  @ApiProperty({ description: 'Number of 2-star reviews', example: 1 })
  twoStarCount: number;

  @ApiProperty({ description: 'Number of 1-star reviews', example: 1 })
  oneStarCount: number;
}
