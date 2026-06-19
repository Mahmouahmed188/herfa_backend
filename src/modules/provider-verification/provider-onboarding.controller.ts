import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { ProviderVerificationService } from './provider-verification.service';
import { SubmitProviderOnboardingDto } from './dto/submit-provider-onboarding.dto';
import {
  ProviderOnboardingStatusDto,
  ProviderOnboardingSubmitResponseDto,
} from './dto/provider-onboarding-status.dto';

@ApiTags('Provider Onboarding')
@ApiBearerAuth()
@Controller('provider/onboarding')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROVIDER)
export class ProviderOnboardingController {
  constructor(
    private readonly verificationService: ProviderVerificationService,
  ) {}

  @Post('submit')
  @ApiOperation({
    summary: 'Submit provider onboarding verification',
    description:
      'Submit verification URLs for provider onboarding. Accepts only URLs (no file uploads). Requires frontIdImage, backIdImage, and personalPhoto. Documents and portfolio are optional.',
  })
  @ApiResponse({
    status: 201,
    description: 'Verification request submitted successfully',
    type: ProviderOnboardingSubmitResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Missing required fields or already under review' })
  @ApiResponse({ status: 404, description: 'Provider profile not found' })
  async submit(
    @CurrentUser() user: any,
    @Body() dto: SubmitProviderOnboardingDto,
  ) {
    const verification = await this.verificationService.submitOnboarding(
      user.id,
      dto,
    );
    return {
      success: true,
      status: 'PENDING',
      message: 'Verification request submitted successfully',
    };
  }

  @Get('status')
  @ApiOperation({
    summary: 'Get provider onboarding status',
    description:
      'Get the current onboarding verification status for the authenticated provider.',
  })
  @ApiResponse({
    status: 200,
    description: 'Current onboarding status',
    type: ProviderOnboardingStatusDto,
  })
  async getStatus(@CurrentUser() user: any): Promise<ProviderOnboardingStatusDto> {
    const verification = await this.verificationService.findOnboardingStatus(
      user.id,
    );

    if (!verification) {
      return {
        status: 'UNVERIFIED',
        submittedAt: null,
        reviewedAt: null,
        adminNote: null,
      };
    }

    const statusMap: Record<string, string> = {
      pending: 'UNVERIFIED',
      under_review: 'PENDING',
      approved: 'APPROVED',
      rejected: 'REJECTED',
      suspended: 'REJECTED',
    };

    return {
      status: statusMap[verification.status] || 'UNVERIFIED',
      submittedAt: verification.submittedAt || null,
      reviewedAt: verification.reviewedAt || null,
      adminNote:
        verification.adminNote ||
        verification.rejectionReason ||
        verification.suspensionReason ||
        null,
    };
  }
}
