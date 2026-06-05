import {
  Controller,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { TrackingService } from './tracking.service';
import { StartTrackingDto } from './dto/start-tracking.dto';
import { LocationUpdateDto } from './dto/location-update.dto';
import {
  StartTrackingResponseDto,
  LocationUpdateResponseDto,
  PauseResumeResponseDto,
} from './dto/tracking-session.dto';
import { TrackingSessionStatus } from './enums/tracking-session-status.enum';

@ApiTags('Tracking - Provider')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class ProviderTrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('tracking/start')
  @Roles(UserRole.PROVIDER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start a tracking session',
    description:
      'Provider starts a tracking session for an accepted, on_the_way, or in_progress booking',
  })
  @ApiResponse({
    status: 201,
    description: 'Tracking session started successfully',
    type: StartTrackingResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid booking status or session already exists' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  @ApiResponse({ status: 403, description: 'Booking does not belong to this provider' })
  async start(
    @Body() dto: StartTrackingDto,
    @CurrentUser('id') userId: string,
  ) {
    const session = await this.trackingService.startSession(dto.bookingId, userId);
    return {
      success: true,
      data: {
        id: session.id,
        bookingId: session.bookingId,
        status: session.status,
        startedAt: session.startedAt,
      },
    };
  }

  @Patch('tracking/location')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({
    summary: 'Update provider location',
    description: 'Provider sends a location update for their active tracking session',
  })
  @ApiResponse({
    status: 200,
    description: 'Location updated successfully',
    type: LocationUpdateResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid coordinates or session not active' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  async updateLocation(
    @Body() dto: LocationUpdateDto,
    @CurrentUser() user: any,
  ) {
    const session = await this.trackingService.getActiveSessionByProvider(user.id);
    if (!session) {
      return { success: false, message: 'No active tracking session found', errorCode: 'TRACKING_006' };
    }
    const location = await this.trackingService.updateLocation(session.id, dto);
    return {
      success: true,
      data: {
        id: location.id,
        recordedAt: location.recordedAt,
      },
    };
  }

  @Patch('tracking/pause')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({
    summary: 'Pause tracking session',
    description: 'Provider pauses their active tracking session',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking paused successfully',
    type: PauseResumeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Session is not active' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  async pause(@CurrentUser() user: any) {
    const session = await this.trackingService.getActiveSessionByProvider(user.id);
    if (!session) {
      return { success: false, message: 'No active tracking session found', errorCode: 'TRACKING_004' };
    }
    const updated = await this.trackingService.pauseSession(session.id);
    return {
      success: true,
      data: {
        sessionId: updated.id,
        previousStatus: TrackingSessionStatus.ACTIVE,
        newStatus: updated.status,
        timestamp: new Date(),
      },
    };
  }

  @Patch('tracking/resume')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({
    summary: 'Resume tracking session',
    description: 'Provider resumes a paused tracking session',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking resumed successfully',
    type: PauseResumeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Session is not paused' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  async resume(@CurrentUser() user: any) {
    const session = await this.trackingService.getPausedSessionByProvider(user.id);
    if (!session) {
      return { success: false, message: 'No paused tracking session found', errorCode: 'TRACKING_005' };
    }
    const updated = await this.trackingService.resumeSession(session.id);
    return {
      success: true,
      data: {
        sessionId: updated.id,
        previousStatus: TrackingSessionStatus.PAUSED,
        newStatus: updated.status,
        timestamp: new Date(),
      },
    };
  }

  @Patch('tracking/complete')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({
    summary: 'Complete tracking session',
    description: 'Provider completes the tracking session when booking is done',
  })
  @ApiResponse({
    status: 200,
    description: 'Tracking completed successfully',
  })
  @ApiResponse({ status: 400, description: 'Session cannot be completed' })
  @ApiResponse({ status: 401, description: 'Unauthenticated' })
  async complete(@CurrentUser() user: any) {
    const session = await this.trackingService.getActiveSessionByProvider(user.id);
    if (!session) {
      return { success: false, message: 'No active tracking session found', errorCode: 'TRACKING_006' };
    }
    const updated = await this.trackingService.completeSession(session.id);
    return {
      success: true,
      data: {
        sessionId: updated.id,
        status: updated.status,
        endedAt: updated.endedAt,
      },
    };
  }
}
