import { Controller, Get, Patch, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, UserStatus } from '../../common/constants/user.enums';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async getAllUsers(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    return this.adminService.getAllUsers(page, limit, role, status);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status' })
  async updateUserStatus(@Param('id') id: string, @Body('status') status: UserStatus) {
    return this.adminService.updateUserStatus(id, status);
  }

  @Get('applications')
  @ApiOperation({ summary: 'Get pending applications' })
  async getPendingApplications(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getPendingApplications(page, limit);
  }

  @Post('applications/:id/approve')
  @ApiOperation({ summary: 'Approve provider application' })
  async approveApplication(@Param('id') id: string) {
    return this.adminService.approveApplication(id);
  }

  @Post('applications/:id/reject')
  @ApiOperation({ summary: 'Reject provider application' })
  async rejectApplication(@Param('id') id: string, @Body('reason') reason: string) {
    return this.adminService.rejectApplication(id, reason);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'Get all jobs' })
  async getAllJobs(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: string) {
    return this.adminService.getAllJobs(page, limit, status);
  }
}