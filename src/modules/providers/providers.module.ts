import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersController } from './providers.controller';
import { ProvidersService } from './providers.service';
import { User } from '../../entities/user.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { ProviderApplication } from '../../entities/provider-application.entity';
import { ProviderService } from '../../entities/provider-service.entity';
import { Service } from '../../entities/service.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      ProviderProfile,
      ProviderApplication,
      ProviderService,
      Service,
    ]),
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService],
})
export class ProvidersModule {}