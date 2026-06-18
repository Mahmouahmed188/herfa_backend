import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { ReviewFilterDto } from './dto/review-filter.dto';

@ApiTags('Provider Reviews (Public)')
@Controller('providers')
export class PublicReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':providerId/reviews')
  @ApiOperation({ summary: 'Get paginated public reviews for a provider' })
  async getReviews(
    @Param('providerId') providerId: string,
    @Query() filter: ReviewFilterDto,
  ) {
    return this.reviewsService.getPublicProviderReviews(providerId, filter);
  }

  @Get(':providerId/rating')
  @ApiOperation({ summary: 'Get public rating statistics for a provider' })
  async getRating(@Param('providerId') providerId: string) {
    return this.reviewsService.getPublicProviderStats(providerId);
  }
}
