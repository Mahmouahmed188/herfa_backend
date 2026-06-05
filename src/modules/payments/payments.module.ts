import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { PaymentsAdminController } from './payments-admin.controller';
import { ProviderPaymentsController } from './payments-provider.controller';
import { PaymentsService } from './payments.service';
import { PaymentsAdminService } from './payments-admin.service';
import { AuditService } from './services/audit.service';
import { Payment } from '../../entities/payment.entity';
import { AuditLog } from '../../entities/audit-log.entity';
import { RefundsModule } from '../refunds/refunds.module';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, AuditLog]), RefundsModule],
  controllers: [
    PaymentsController,
    PaymentsAdminController,
    ProviderPaymentsController,
  ],
  providers: [PaymentsService, PaymentsAdminService, AuditService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
