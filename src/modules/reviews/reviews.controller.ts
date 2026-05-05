import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ReviewType } from '../../common/constants/user.enums';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Create review' })
  async create(
    @CurrentUser() user: any,
    @Body() body: { jobId: string; type: ReviewType; rating: number; comment?: string },
  ) {
    return this.reviewsService.create(user.id, body.jobId, body.type, body.rating, body.comment);
  }

  @Get('provider/:providerId')
  @ApiOperation({ summary: 'Get provider reviews' })
  async getProviderReviews(@Param('providerId') providerId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.reviewsService.getReviewsForProvider(providerId, page, limit);
  }
}