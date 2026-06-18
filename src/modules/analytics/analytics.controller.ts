import { Controller, Get, Query, UseGuards, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { DashboardService } from './services/dashboard.service';
import { UserAnalyticsService } from './services/user-analytics.service';
import { BookingAnalyticsService } from './services/booking-analytics.service';
import { RevenueAnalyticsService } from './services/revenue-analytics.service';
import { ProviderAnalyticsService } from './services/provider-analytics.service';
import { ReviewAnalyticsService } from './services/review-analytics.service';
import { SupportAnalyticsService } from './services/support-analytics.service';
import { GeographicAnalyticsService } from './services/geographic-analytics.service';
import { ActivityLogService } from './services/activity-log.service';
import { DateRangePreset } from './dto/date-range-filter.dto';
import { DashboardOverviewDto } from './dto/dashboard-overview.dto';
import { UserAnalyticsDto } from './dto/user-analytics.dto';
import { BookingAnalyticsDto } from './dto/booking-analytics.dto';
import { RevenueAnalyticsDto } from './dto/revenue-analytics.dto';
import { ProviderAnalyticsDto } from './dto/provider-analytics.dto';
import { ReviewAnalyticsDto } from './dto/review-analytics.dto';
import { SupportAnalyticsDto } from './dto/support-analytics.dto';
import { GeographicAnalyticsDto } from './dto/geographic-analytics.dto';

@ApiTags('Admin - Dashboard')
@Controller('admin/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly userAnalyticsService: UserAnalyticsService,
    private readonly bookingAnalyticsService: BookingAnalyticsService,
    private readonly revenueAnalyticsService: RevenueAnalyticsService,
    private readonly providerAnalyticsService: ProviderAnalyticsService,
    private readonly reviewAnalyticsService: ReviewAnalyticsService,
    private readonly supportAnalyticsService: SupportAnalyticsService,
    private readonly geographicAnalyticsService: GeographicAnalyticsService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Get dashboard overview with all 13 widget metrics',
  })
  @ApiResponse({ status: 200, type: DashboardOverviewDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'dateRange', enum: DateRangePreset, required: false })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Custom start date (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Custom end date (ISO 8601)',
  })
  async getOverview(
    @Query('dateRange') dateRange?: DateRangePreset,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const result = await this.dashboardService.getOverview(
      dateRange,
      startDate,
      endDate,
    );

    if (req.user) {
      await this.activityLogService.create({
        adminId: req.user.id,
        action: 'dashboard_view',
        entityType: 'Dashboard',
        metadata: { section: 'overview', dateRange: dateRange || 'default' },
      });
    }

    return { success: true, data: result };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user growth and engagement analytics' })
  @ApiResponse({ status: 200, type: UserAnalyticsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'dateRange', enum: DateRangePreset, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getUserAnalytics(
    @Query('dateRange') dateRange?: DateRangePreset,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const result = await this.userAnalyticsService.getAnalytics(
      dateRange,
      startDate,
      endDate,
    );

    if (req.user) {
      await this.activityLogService.create({
        adminId: req.user.id,
        action: 'dashboard_view',
        entityType: 'UserAnalytics',
        metadata: { dateRange: dateRange || 'default' },
      });
    }

    return { success: true, data: result };
  }

  @Get('bookings')
  @ApiOperation({ summary: 'Get booking performance analytics' })
  @ApiResponse({ status: 200, type: BookingAnalyticsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'dateRange', enum: DateRangePreset, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getBookingAnalytics(
    @Query('dateRange') dateRange?: DateRangePreset,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const result = await this.bookingAnalyticsService.getAnalytics(
      dateRange,
      startDate,
      endDate,
    );

    if (req.user) {
      await this.activityLogService.create({
        adminId: req.user.id,
        action: 'dashboard_view',
        entityType: 'BookingAnalytics',
        metadata: { dateRange: dateRange || 'default' },
      });
    }

    return { success: true, data: result };
  }

  @Get('revenue')
  @ApiOperation({ summary: 'Get revenue and financial analytics' })
  @ApiResponse({ status: 200, type: RevenueAnalyticsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'dateRange', enum: DateRangePreset, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getRevenueAnalytics(
    @Query('dateRange') dateRange?: DateRangePreset,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const result = await this.revenueAnalyticsService.getAnalytics(
      dateRange,
      startDate,
      endDate,
    );

    if (req.user) {
      await this.activityLogService.create({
        adminId: req.user.id,
        action: 'dashboard_view',
        entityType: 'RevenueAnalytics',
        metadata: { dateRange: dateRange || 'default' },
      });
    }

    return { success: true, data: result };
  }

  @Get('providers')
  @ApiOperation({ summary: 'Get provider performance analytics' })
  @ApiResponse({ status: 200, type: ProviderAnalyticsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'dateRange', enum: DateRangePreset, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getProviderAnalytics(
    @Query('dateRange') dateRange?: DateRangePreset,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const result = await this.providerAnalyticsService.getAnalytics(
      dateRange,
      startDate,
      endDate,
    );

    if (req.user) {
      await this.activityLogService.create({
        adminId: req.user.id,
        action: 'dashboard_view',
        entityType: 'ProviderAnalytics',
        metadata: { dateRange: dateRange || 'default' },
      });
    }

    return { success: true, data: result };
  }

  @Get('reviews')
  @ApiOperation({ summary: 'Get review and satisfaction analytics' })
  @ApiResponse({ status: 200, type: ReviewAnalyticsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'dateRange', enum: DateRangePreset, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getReviewAnalytics(
    @Query('dateRange') dateRange?: DateRangePreset,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const result = await this.reviewAnalyticsService.getAnalytics(
      dateRange,
      startDate,
      endDate,
    );

    if (req.user) {
      await this.activityLogService.create({
        adminId: req.user.id,
        action: 'dashboard_view',
        entityType: 'ReviewAnalytics',
        metadata: { dateRange: dateRange || 'default' },
      });
    }

    return { success: true, data: result };
  }

  @Get('support')
  @ApiOperation({ summary: 'Get support performance analytics' })
  @ApiResponse({ status: 200, type: SupportAnalyticsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'dateRange', enum: DateRangePreset, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getSupportAnalytics(
    @Query('dateRange') dateRange?: DateRangePreset,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const result = await this.supportAnalyticsService.getAnalytics(
      dateRange,
      startDate,
      endDate,
    );

    if (req.user) {
      await this.activityLogService.create({
        adminId: req.user.id,
        action: 'dashboard_view',
        entityType: 'SupportAnalytics',
        metadata: { dateRange: dateRange || 'default' },
      });
    }

    return { success: true, data: result };
  }

  @Get('geographic')
  @ApiOperation({ summary: 'Get geographic activity data by city' })
  @ApiResponse({ status: 200, type: GeographicAnalyticsDto })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'dateRange', enum: DateRangePreset, required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getGeographicAnalytics(
    @Query('dateRange') dateRange?: DateRangePreset,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Req() req?: any,
  ) {
    const result = await this.geographicAnalyticsService.getAnalytics(
      dateRange,
      startDate,
      endDate,
    );

    if (req.user) {
      await this.activityLogService.create({
        adminId: req.user.id,
        action: 'dashboard_view',
        entityType: 'GeographicAnalytics',
        metadata: { dateRange: dateRange || 'default' },
      });
    }

    return { success: true, data: result };
  }
}
