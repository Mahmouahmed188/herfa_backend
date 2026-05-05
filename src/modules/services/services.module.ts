import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServicesController, AdminServicesController } from './services.controller';
import { Service } from '../../entities/service.entity';
import { ServiceCategory } from '../../entities/service-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Service, ServiceCategory])],
  controllers: [ServicesController, AdminServicesController],
  providers: [],
})
export class ServicesModule {}