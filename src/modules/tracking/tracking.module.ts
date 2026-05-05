import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TrackingGateway } from './tracking.gateway';
import { NotificationsGateway } from './notifications.gateway';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'herfa-secret-key',
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [TrackingGateway, NotificationsGateway],
  exports: [TrackingGateway, NotificationsGateway],
})
export class TrackingModule {}