import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewFilterDto } from './dto/review-filter.dto';

@ApiTags('Reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.CUSTOMER)
@ApiBearerAuth()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a review for a completed booking' })
  @ApiResponse({ status: 201, description: 'Review created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Booking not completed or already reviewed',
  })
  @ApiResponse({ status: 404, description: 'Booking not found' })
  async create(@CurrentUser() user: any, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(user.id, dto);
  }

  @Get('mine')
  @ApiOperation({ summary: 'List my submitted reviews' })
  async findMyReviews(
    @CurrentUser() user: any,
    @Query() filter: ReviewFilterDto,
  ) {
    return this.reviewsService.findAllByCustomer(user.id, filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get review by ID' })
  @ApiResponse({ status: 200, description: 'Review found' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit my review (within 24 hours)' })
  @ApiResponse({ status: 200, description: 'Review updated' })
  @ApiResponse({
    status: 400,
    description: 'Edit window expired or invalid update',
  })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete my review (within 24 hours)' })
  @ApiResponse({ status: 204, description: 'Review deleted' })
  @ApiResponse({ status: 400, description: 'Delete window expired' })
  @ApiResponse({ status: 404, description: 'Review not found' })
  async delete(@CurrentUser() user: any, @Param('id') id: string) {
    await this.reviewsService.delete(id, user.id);
  }
}
