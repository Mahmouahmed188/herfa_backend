import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TrackingGateway } from './tracking.gateway';
import { NotificationsGateway } from './notifications.gateway';
import { TrackingService } from './tracking.service';
import { TrackingController } from './tracking.controller';
import { ProviderTrackingController } from './provider-tracking.controller';
import { AdminTrackingController } from './admin-tracking.controller';
import { TrackingSession } from '../../entities/tracking-session.entity';
import { TrackingLocation } from '../../entities/tracking-location.entity';
import { TrackingAuditEvent } from '../../entities/tracking-audit-event.entity';
import { TrackingOwnershipGuard } from './guards/tracking-ownership.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TrackingSession,
      TrackingLocation,
      TrackingAuditEvent,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'herfa-secret-key',
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    TrackingController,
    ProviderTrackingController,
    AdminTrackingController,
  ],
  providers: [
    TrackingGateway,
    NotificationsGateway,
    TrackingService,
    TrackingOwnershipGuard,
  ],
  exports: [TrackingGateway, NotificationsGateway, TrackingService],
})
export class TrackingModule {}
