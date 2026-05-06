"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const throttler_1 = require("@nestjs/throttler");
const event_emitter_1 = require("@nestjs/event-emitter");
const bull_1 = require("@nestjs/bull");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const providers_module_1 = require("./modules/providers/providers.module");
const services_module_1 = require("./modules/services/services.module");
const jobs_module_1 = require("./modules/jobs/jobs.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const payments_module_1 = require("./modules/payments/payments.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const admin_module_1 = require("./modules/admin/admin.module");
const tracking_module_1 = require("./modules/tracking/tracking.module");
const customers_module_1 = require("./modules/customers/customers.module");
const tenders_module_1 = require("./modules/tenders/tenders.module");
const messages_module_1 = require("./modules/messages/messages.module");
const verification_module_1 = require("./modules/verification/verification.module");
const uploads_module_1 = require("./modules/uploads/uploads.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => {
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
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    throttlers: [
                        { name: 'default', ttl: 60000, limit: 100 },
                        { name: 'short', ttl: 1000, limit: 10 },
                    ],
                }),
                inject: [config_1.ConfigService],
            }),
            event_emitter_1.EventEmitterModule.forRoot(),
            bull_1.BullModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    redis: {
                        host: configService.get('REDIS_HOST') || 'localhost',
                        port: parseInt(configService.get('REDIS_PORT') || '6379'),
                        password: configService.get('REDIS_PASSWORD'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(__dirname, '..', 'uploads'),
                serveRoot: '/uploads',
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            providers_module_1.ProvidersModule,
            services_module_1.ServicesModule,
            jobs_module_1.JobsModule,
            notifications_module_1.NotificationsModule,
            payments_module_1.PaymentsModule,
            reviews_module_1.ReviewsModule,
            admin_module_1.AdminModule,
            tracking_module_1.TrackingModule,
            customers_module_1.CustomersModule,
            tenders_module_1.TendersModule,
            messages_module_1.MessagesModule,
            verification_module_1.VerificationModule,
            uploads_module_1.UploadsModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map