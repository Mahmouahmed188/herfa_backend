import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { TrackingService } from './tracking.service';
import {
  TrackingSessionResponseDto,
  PaginatedHistoryDto,
} from './dto/tracking-session.dto';

@ApiTags('Tracking - Customer')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':bookingId')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get current tracking status',
    description:
      'Customer views the current tracking status and provider location for their booking',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking status retrieved',
    type: TrackingSessionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @ApiResponse({ status: 403, description: 'You do not own this booking' })
  @ApiResponse({ status: 404, description: 'No tracking session found' })
  async getTracking(
    @Param('bookingId') bookingId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.trackingService.getSession(bookingId, userId);
    return { success: true, data: result };
  }

  @Get(':bookingId/history')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({
    summary: 'Get tracking history',
    description:
      'Customer views the immutable location history for a completed booking',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 50, max: 200)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking history retrieved',
    type: PaginatedHistoryDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @ApiResponse({ status: 403, description: 'You do not own this booking' })
  async getHistory(
    @Param('bookingId') bookingId: string,
    @CurrentUser('id') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const result = await this.trackingService.getHistory(bookingId, userId, {
      page: page || 1,
      limit: limit || 50,
    });
    return { success: true, data: result };
  }
}
