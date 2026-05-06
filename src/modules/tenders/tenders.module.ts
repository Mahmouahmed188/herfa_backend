import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TendersController } from './tenders.controller';
import { TendersService } from './tenders.service';
import { Tender } from '../../entities/tender.entity';
import { TenderOffer } from '../../entities/tender-offer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Tender, TenderOffer])],
  controllers: [TendersController],
  providers: [TendersService],
  exports: [TendersService],
})
export class TendersModule {}
