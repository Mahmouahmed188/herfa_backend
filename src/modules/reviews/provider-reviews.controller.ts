import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { ReviewFilterDto } from './dto/review-filter.dto';

@ApiTags('Provider Reviews')
@Controller('provider/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROVIDER)
@ApiBearerAuth()
export class ProviderReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List reviews received by the authenticated provider' })
  async getReviews(@CurrentUser() user: any, @Query() filter: ReviewFilterDto) {
    const providerId = user.id;
    return this.reviewsService.getProviderReviews(providerId, filter);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get rating statistics for the authenticated provider' })
  async getStats(@CurrentUser() user: any) {
    const providerId = user.id;
    return this.reviewsService.getProviderStats(providerId);
  }
}
