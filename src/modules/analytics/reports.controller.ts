import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { ReportService } from './services/report.service';
import { ActivityLogService } from './services/activity-log.service';
import { ReportFilterDto } from './dto/report-filter.dto';

@ApiTags('Admin - Reports')
@Controller('admin/reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class ReportsController {
  constructor(
    private readonly reportService: ReportService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  @Get(':type')
  @ApiOperation({ summary: 'Get paginated report data' })
  @ApiResponse({ status: 200, description: 'Paginated report data' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiQuery({ name: 'sortBy', required: false })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['ASC', 'DESC'] })
  @ApiQuery({ name: 'dateFrom', required: false })
  @ApiQuery({ name: 'dateTo', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'search', required: false })
  async getReport(
    @Param('type') type: string,
    @Query() filter: ReportFilterDto,
    @Req() req?: any,
  ) {
    const result = await this.reportService.getReport(type as any, filter);

    if (req.user) {
      await this.activityLogService.create({
        adminId: req.user.id,
        action: 'report_export',
        entityType: 'Report',
        metadata: { reportType: type, filters: filter },
      });
    }

    return { success: true, ...result };
  }

  @Get(':type/export')
  @ApiOperation({ summary: 'Export report as CSV or Excel' })
  @ApiResponse({ status: 200, description: 'File download' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiQuery({ name: 'format', required: true, enum: ['csv', 'xlsx'] })
  async exportReport(
    @Param('type') type: string,
    @Query('format') format: 'csv' | 'xlsx',
    @Query() filter: ReportFilterDto,
    @Res() res: Response,
    @Req() req?: any,
  ) {
    if (format === 'csv') {
      const csv = await this.reportService.exportCSV(type as any, filter);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${type}-report.csv"`,
      );
      res.send(csv);
    } else if (format === 'xlsx') {
      const buffer = await this.reportService.exportXLSX(type as any, filter);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${type}-report.xlsx"`,
      );
      res.send(buffer);
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid format. Use csv or xlsx.',
        errorCode: 'VALIDATION_ERROR',
      });
      return;
    }

    if (req.user) {
      await this.activityLogService.create({
        adminId: req.user.id,
        action: 'report_export',
        entityType: 'Report',
        entityId: type,
        metadata: { reportType: type, format },
      });
    }
  }
}
