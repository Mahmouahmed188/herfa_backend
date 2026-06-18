import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ProvidersController,
  AdminProvidersController,
} from './providers.controller';
import { ProvidersService } from './providers.service';
import { User } from '../../entities/user.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { ProviderApplication } from '../../entities/provider-application.entity';
import { ProviderService } from '../../entities/provider-service.entity';
import { Service } from '../../entities/service.entity';
import { ProviderCategory } from '../../entities/provider-category.entity';
import { ServiceCategory } from '../../entities/service-category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ProviderProfile,
      ProviderApplication,
      ProviderService,
      Service,
      ProviderCategory,
      ServiceCategory,
    ]),
  ],
  controllers: [ProvidersController, AdminProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}
