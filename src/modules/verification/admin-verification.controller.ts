import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  BadRequestException,
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
import { UserRole } from '../../common/constants/user.enums';

@ApiTags('Admin - Verifications')
@ApiBearerAuth()
@Controller('admin/verifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
export class AdminVerificationController {
  constructor(
    private readonly verificationService: VerificationService,
  ) {}

  @Patch(':id/approve')
  @ApiOperation({
    summary: 'Approve verification request',
    description:
      'Approve a provider verification request. Status changes to APPROVED.',
  })
  @ApiResponse({ status: 200, description: 'Verification approved' })
  @ApiResponse({ status: 404, description: 'Verification not found' })
  async approve(
    @Param('id') id: string,
    @Body() body: { adminNote?: string },
  ) {
    const result = await this.verificationService.reviewVerification(
      id,
      'APPROVED' as any,
      body.adminNote,
    );
    return {
      success: true,
      message: 'Verification approved successfully',
      data: { status: result.status },
    };
  }

  @Patch(':id/reject')
  @ApiOperation({
    summary: 'Reject verification request',
    description:
      'Reject a provider verification request with an admin note. Status changes to REJECTED.',
  })
  @ApiResponse({ status: 200, description: 'Verification rejected' })
  @ApiResponse({ status: 400, description: 'Admin note is required' })
  @ApiResponse({ status: 404, description: 'Verification not found' })
  async reject(
    @Param('id') id: string,
    @Body() body: { adminNote?: string },
  ) {
    if (!body.adminNote) {
      throw new BadRequestException('Admin note is required when rejecting');
    }
    const result = await this.verificationService.reviewVerification(
      id,
      'REJECTED' as any,
      body.adminNote,
    );
    return {
      success: true,
      message: 'Verification rejected',
      data: { status: result.status },
    };
  }
}
