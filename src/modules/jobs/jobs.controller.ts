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
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JobsService } from './jobs.service';
import { CreateJobDto, UpdateJobDto, AcceptJobDto, RejectJobDto, JobQueryDto } from './dto/jobs.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new job' })
  async create(@CurrentUser() user: any, @Body() dto: CreateJobDto) {
    return this.jobsService.create(user.id, dto);
  }

  @Get('my-jobs')
  @ApiOperation({ summary: 'Get customer jobs' })
  async getCustomerJobs(@CurrentUser() user: any, @Query() query: JobQueryDto) {
    return this.jobsService.findByCustomer(user.id, query);
  }

  @Get('assigned')
  @ApiOperation({ summary: 'Get provider assigned jobs' })
  async getProviderJobs(@CurrentUser() user: any, @Query() query: JobQueryDto) {
    return this.jobsService.findByProvider(user.id, query);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available jobs for provider' })
  async getAvailableJobs(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('radiusKm') radiusKm?: number,
  ) {
    return this.jobsService.getAvailableJobs(latitude, longitude, radiusKm);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get job by ID' })
  async getJob(@Param('id') id: string) {
    return this.jobsService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update job' })
  async updateJob(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobsService.update(id, user.id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel job' })
  async cancelJob(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('reason') reason?: string,
  ) {
    return this.jobsService.cancel(id, user.id, reason);
  }

  @Post('assignments/accept')
  @ApiOperation({ summary: 'Accept job assignment' })
  async acceptAssignment(@CurrentUser() user: any, @Body() dto: AcceptJobDto) {
    return this.jobsService.acceptAssignment(user.id, dto);
  }

  @Post('assignments/:id/reject')
  @ApiOperation({ summary: 'Reject job assignment' })
  async rejectAssignment(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: RejectJobDto,
  ) {
    return this.jobsService.rejectAssignment(user.id, id, dto);
  }

  @Post(':id/status')
  @ApiOperation({ summary: 'Update job status' })
  async updateStatus(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body('status') status: string,
  ) {
    return this.jobsService.updateJobStatus(id, user.id, status as any);
  }
}