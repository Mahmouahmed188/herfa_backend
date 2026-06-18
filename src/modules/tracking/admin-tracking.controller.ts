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
import { UserRole } from '../../common/constants/user.enums';
import { TrackingService } from './tracking.service';
import { TrackingFilterDto } from './dto/tracking-filter.dto';
import {
  AdminTrackingListDto,
  AdminTrackingDetailDto,
} from './dto/tracking-session.dto';

@ApiTags('Tracking - Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/tracking')
export class AdminTrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get()
  @ApiOperation({
    summary: 'List all tracking sessions',
    description:
      'Admin views all tracking sessions with filtering, pagination, and sorting',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'bookingId',
    required: false,
    description: 'Filter by booking ID',
  })
  @ApiQuery({
    name: 'providerId',
    required: false,
    description: 'Filter by provider ID',
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter by customer ID',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Filter by start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Filter by end date (ISO 8601)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page',
  })
  @ApiQuery({ name: 'sortBy', required: false, description: 'Sort field' })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort order (ASC/DESC)',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking sessions list retrieved',
  })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async findAll(@Query() filter: TrackingFilterDto) {
    const result = await this.trackingService.getAdminSessions(filter);
    return { success: true, data: result };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get tracking session detail',
    description:
      'Admin views full details of a tracking session including location history',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking session detail retrieved',
    type: AdminTrackingDetailDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'Tracking session not found' })
  async findOne(@Param('id') id: string) {
    const result = await this.trackingService.getAdminSessionDetail(id);
    return { success: true, data: result };
  }
}
