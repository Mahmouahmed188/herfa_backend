import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefundsService } from './refunds.service';
import { Refund } from '../../entities/refund.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Refund])],
  providers: [RefundsService],
  exports: [RefundsService],
})
export class RefundsModule {}
