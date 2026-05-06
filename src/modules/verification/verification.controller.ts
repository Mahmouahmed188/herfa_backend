import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { VerificationService } from './verification.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { VerificationStatus } from '../../entities/technician-verification.entity';

@Controller('verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('submit')
  async submit(@CurrentUser() user: any, @Body() data: any) {
    return this.verificationService.submitVerification(user.id, data);
  }

  @Get('status')
  async getStatus(@CurrentUser() user: any) {
    return this.verificationService.getStatus(user.id);
  }

  @Patch('review/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async review(
    @Param('id') id: string,
    @Body('status') status: VerificationStatus,
    @Body('adminNote') adminNote?: string,
  ) {
    return this.verificationService.reviewVerification(id, status, adminNote);
  }
}
