import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { ProviderVerificationAdminService } from './provider-verification-admin.service';
import { AdminVerificationFilterDto } from './dto/admin-verification-filter.dto';
import { ApproveVerificationDto } from './dto/approve-verification.dto';
import { RejectVerificationDto } from './dto/reject-verification.dto';
import {
  SuspendProviderDto,
  ReactivateProviderDto,
} from './dto/suspend-reactivate.dto';
import {
  AdminVerificationListDto,
  AdminVerificationDetailDto,
  AdminVerificationListItemDto,
} from './dto/admin-verification-response.dto';

@ApiTags('Admin - Provider Verifications')
@ApiBearerAuth()
@Controller('admin/provider-verifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class ProviderVerificationAdminController {
  constructor(
    private readonly adminService: ProviderVerificationAdminService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all provider verifications',
    description:
      'Get a paginated, filterable, sortable list of all provider verification applications.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by provider name',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by provider category',
  })
  @ApiQuery({
    name: 'dateFrom',
    required: false,
    description: 'Filter submissions from date',
  })
  @ApiQuery({
    name: 'dateTo',
    required: false,
    description: 'Filter submissions to date',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page (default: 10, max: 100)',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Sort field (submittedAt, status)',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Sort direction (asc, desc)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of verifications',
    type: AdminVerificationListDto,
  })
  async findAll(@Query() filter: AdminVerificationFilterDto) {
    return this.adminService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get verification details',
    description:
      'Get full details of a verification application including provider info, documents, and history.',
  })
  @ApiResponse({
    status: 200,
    description: 'Verification details',
    type: AdminVerificationDetailDto,
  })
  @ApiResponse({ status: 404, description: 'Verification record not found' })
  async findOne(@Param('id') id: string) {
    return this.adminService.findOne(id);
  }

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve provider verification',
    description:
      "Approve a provider's verification application. Status changes from under_review to approved.",
  })
  @ApiResponse({
    status: 200,
    description: 'Verification approved successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition or self-approval',
  })
  @ApiResponse({ status: 404, description: 'Verification record not found' })
  async approve(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ApproveVerificationDto,
  ) {
    const verification = await this.adminService.approve(
      id,
      user.id,
      dto.notes,
    );
    return {
      id: verification.id,
      status: verification.status,
      message: 'Provider verification approved successfully',
    };
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject provider verification',
    description:
      "Reject a provider's verification application with a required reason. Status changes from under_review to rejected.",
  })
  @ApiResponse({ status: 200, description: 'Verification rejected' })
  @ApiResponse({
    status: 400,
    description: 'Rejection reason required or invalid transition',
  })
  @ApiResponse({ status: 404, description: 'Verification record not found' })
  async reject(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: RejectVerificationDto,
  ) {
    const verification = await this.adminService.reject(
      id,
      user.id,
      dto.reason,
      dto.notes,
    );
    return {
      id: verification.id,
      status: verification.status,
      message: 'Provider verification rejected',
    };
  }

  @Patch(':id/suspend')
  @ApiOperation({
    summary: 'Suspend a provider',
    description:
      'Suspend an approved provider with a required reason. Status changes from approved to suspended.',
  })
  @ApiResponse({ status: 200, description: 'Provider suspended' })
  @ApiResponse({
    status: 400,
    description: 'Suspension reason required or invalid transition',
  })
  @ApiResponse({ status: 404, description: 'Verification record not found' })
  async suspend(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: SuspendProviderDto,
  ) {
    const verification = await this.adminService.suspend(
      id,
      user.id,
      dto.reason,
      dto.notes,
    );
    return {
      id: verification.id,
      status: verification.status,
      message: 'Provider suspended successfully',
    };
  }

  @Patch(':id/reactivate')
  @ApiOperation({
    summary: 'Reactivate a suspended provider',
    description:
      'Reactivate a suspended provider. Status changes from suspended to approved.',
  })
  @ApiResponse({ status: 200, description: 'Provider reactivated' })
  @ApiResponse({ status: 400, description: 'Invalid transition' })
  @ApiResponse({ status: 404, description: 'Verification record not found' })
  async reactivate(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: ReactivateProviderDto,
  ) {
    const verification = await this.adminService.reactivate(
      id,
      user.id,
      dto.notes,
    );
    return {
      id: verification.id,
      status: verification.status,
      message: 'Provider reactivated successfully',
    };
  }
}
