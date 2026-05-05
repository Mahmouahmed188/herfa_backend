import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController, ProviderPaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from '../../entities/payment.entity';
import { Job } from '../../entities/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Job])],
  controllers: [PaymentsController, ProviderPaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}