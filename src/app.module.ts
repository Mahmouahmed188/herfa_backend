import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { BullModule } from '@nestjs/bull';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProvidersModule } from './modules/providers/providers.module';
import { ServicesModule } from './modules/services/services.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { CustomersModule } from './modules/customers/customers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const useSqlite = configService.get('USE_SQLITE') === 'true';
        
        if (useSqlite) {
          return {
            type: 'better-sqlite3',
            database: configService.get('SQLITE_PATH') || 'herfa.db',
            entities: [__dirname + '/entities/*.entity{.ts,.js}'],
            synchronize: true,
            logging: configService.get('NODE_ENV') !== 'production',
            extra: {
              timeout: 30000,
            },
          };
        }
        
        return {
          type: 'postgres',
          host: configService.get('DB_HOST') || 'localhost',
          port: parseInt(configService.get('DB_PORT') || '5432'),
          username: configService.get('DB_USERNAME') || 'postgres',
          password: configService.get('DB_PASSWORD') || 'postgres',
          database: configService.get('DB_DATABASE') || 'herfa',
          entities: [__dirname + '/entities/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') !== 'production',
          logging: configService.get('NODE_ENV') !== 'production',
          ssl: configService.get('NODE_ENV') === 'production' ? { rejectUnauthorized: false } : false,
        };
      },
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          { name: 'default', ttl: 60000, limit: 100 },
          { name: 'short', ttl: 1000, limit: 10 },
        ],
      }),
      inject: [ConfigService],
    }),
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST') || 'localhost',
          port: parseInt(configService.get('REDIS_PORT') || '6379'),
          password: configService.get('REDIS_PASSWORD'),
        },
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    AuthModule,
    UsersModule,
    ProvidersModule,
    ServicesModule,
    JobsModule,
    NotificationsModule,
    PaymentsModule,
    ReviewsModule,
    AdminModule,
    TrackingModule,
    CustomersModule,
  ],
})
export class AppModule {}