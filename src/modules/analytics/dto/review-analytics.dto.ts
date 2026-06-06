import { ApiProperty } from '@nestjs/swagger';

class TopRatedCategoryEntry {
  @ApiProperty({ example: 'Cleaning' })
  category: string;

  @ApiProperty({ example: 4.6 })
  averageRating: number;
}

class RatingDistribution {
  @ApiProperty({ example: 45 })
  1: number;

  @ApiProperty({ example: 67 })
  2: number;

  @ApiProperty({ example: 234 })
  3: number;

  @ApiProperty({ example: 890 })
  4: number;

  @ApiProperty({ example: 2345 })
  5: number;
}

export class ReviewAnalyticsDto {
  @ApiProperty({ example: 4.3 })
  averageRating: number;

  @ApiProperty({ example: 12 })
  reviewsPerDay: number;

  @ApiProperty({ example: 360 })
  reviewsPerMonth: number;

  @ApiProperty({ type: [TopRatedCategoryEntry] })
  topRatedCategories: TopRatedCategoryEntry[];

  @ApiProperty()
  ratingDistribution: RatingDistribution;
}
