import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ServicesController,
  AdminServicesController,
  ProviderServicesController,
  AdminProviderServicesController,
} from './services.controller';
import { ServicesService } from './services.service';
import { Service } from '../../entities/service.entity';
import { ServiceCategory } from '../../entities/service-category.entity';
import { ServiceListing } from '../../entities/service-listing.entity';
import { ServiceImage } from '../../entities/service-image.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Service,
      ServiceCategory,
      ServiceListing,
      ServiceImage,
    ]),
  ],
  controllers: [
    ServicesController,
    AdminServicesController,
    ProviderServicesController,
    AdminProviderServicesController,
  ],
  providers: [ServicesService],
  exports: [ServicesService],
})
export class ServicesModule {}
