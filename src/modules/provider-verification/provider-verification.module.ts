import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderVerification } from '../../entities/provider-verification.entity';
import { VerificationDocument } from '../../entities/verification-document.entity';
import { VerificationHistory } from '../../entities/verification-history.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { ProviderVerificationService } from './provider-verification.service';
import { ProviderVerificationAdminService } from './provider-verification-admin.service';
import { ProviderVerificationController } from './provider-verification.controller';
import { ProviderVerificationAdminController } from './provider-verification-admin.controller';
import { ProviderOnboardingController } from './provider-onboarding.controller';
import { DocumentService } from './services/document.service';
import { HistoryService } from './services/history.service';
import { AuditService } from './services/audit.service';
import { LocalStorageProvider } from './services/local-storage-provider.service';
import { VerificationOwnerGuard } from './guards/verification-owner.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ProviderVerification,
      VerificationDocument,
      VerificationHistory,
      AuditLog,
      ProviderProfile,
    ]),
  ],
  controllers: [
    ProviderVerificationController,
    ProviderVerificationAdminController,
    ProviderOnboardingController,
  ],
  providers: [
    ProviderVerificationService,
    ProviderVerificationAdminService,
    DocumentService,
    HistoryService,
    AuditService,
    LocalStorageProvider,
    VerificationOwnerGuard,
  ],
  exports: [ProviderVerificationService],
})
export class ProviderVerificationModule {}
