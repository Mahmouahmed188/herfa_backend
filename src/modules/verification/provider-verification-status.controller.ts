import {
  Controller,
  Get,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';

@ApiTags('Provider Verification')
@ApiBearerAuth()
@Controller('provider/verification')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROVIDER)
export class ProviderVerificationStatusController {
  constructor(
    private readonly verificationService: VerificationService,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Get provider onboarding status',
    description:
      'Get the current onboarding/verification status for the authenticated provider.',
  })
  @ApiResponse({ status: 200, description: 'Current verification status' })
  async getStatus(@CurrentUser() user: any) {
    return this.verificationService.getStatus(user.id);
  }
}
