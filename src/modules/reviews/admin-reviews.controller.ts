import { Controller, Get, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { ReviewFilterDto } from './dto/review-filter.dto';

@ApiTags('Admin Reviews')
@Controller('admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'List all reviews (admin)' })
  async findAll(@Query() filter: ReviewFilterDto) {
    return this.reviewsService.adminFindAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review details (admin)' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove a review (moderation)' })
  async remove(@Param('id') id: string, @CurrentUser() user: any, @Body('reason') reason?: string) {
    await this.reviewsService.adminRemoveReview(id, user.id, reason);
  }

  @Get('moderation-log')
  @ApiOperation({ summary: 'View moderation action log' })
  async getModerationLog(@Query() filter: ReviewFilterDto) {
    return this.reviewsService.getModerationLog(filter);
  }
}
