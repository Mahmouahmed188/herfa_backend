import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TechnicianVerification } from '../../entities/technician-verification.entity';
import { VerificationService } from './verification.service';
import { VerificationController } from './verification.controller';
import { AdminVerificationController } from './admin-verification.controller';
import { ProviderVerificationStatusController } from './provider-verification-status.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TechnicianVerification])],
  controllers: [
    VerificationController,
    AdminVerificationController,
    ProviderVerificationStatusController,
  ],
  providers: [VerificationService],
  exports: [VerificationService],
})
export class VerificationModule {}
