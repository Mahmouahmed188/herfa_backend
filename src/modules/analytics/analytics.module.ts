import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { AnalyticsSnapshot } from '../../entities/analytics-snapshot.entity';
import { AdminActivityLog } from '../../entities/admin-activity-log.entity';
import { User } from '../../entities/user.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { Booking } from '../../entities/booking.entity';
import { Service } from '../../entities/service.entity';
import { ServiceCategory } from '../../entities/service-category.entity';
import { Payment } from '../../entities/payment.entity';
import { Review } from '../../entities/review.entity';
import { Refund } from '../../entities/refund.entity';
import { SupportTicket } from '../../entities/support-ticket.entity';
import { Dispute } from '../../entities/dispute.entity';
import { Address } from '../../entities/address.entity';

import { ActivityLogService } from './services/activity-log.service';
import { UserAnalyticsService } from './services/user-analytics.service';
import { ProviderAnalyticsService } from './services/provider-analytics.service';
import { BookingAnalyticsService } from './services/booking-analytics.service';
import { RevenueAnalyticsService } from './services/revenue-analytics.service';
import { ReviewAnalyticsService } from './services/review-analytics.service';
import { SupportAnalyticsService } from './services/support-analytics.service';
import { GeographicAnalyticsService } from './services/geographic-analytics.service';
import { DashboardService } from './services/dashboard.service';
import { ReportService } from './services/report.service';
import { AlertService } from './services/alert.service';
import { AnalyticsSnapshotService } from './services/analytics-snapshot.service';
import { DateRangeFilterService } from './services/date-range-filter.service';

import { AnalyticsController } from './analytics.controller';
import { ReportsController } from './reports.controller';
import { ActivityLogsController } from './activity-logs.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AnalyticsSnapshot,
      AdminActivityLog,
      User,
      ProviderProfile,
      Booking,
      Service,
      ServiceCategory,
      Payment,
      Review,
      Refund,
      SupportTicket,
      Dispute,
      Address,
    ]),
    BullModule.registerQueue(
      { name: 'analytics-snapshot' },
      { name: 'alert-detection' },
    ),
  ],
  controllers: [AnalyticsController, ReportsController, ActivityLogsController],
  providers: [
    ActivityLogService,
    UserAnalyticsService,
    ProviderAnalyticsService,
    BookingAnalyticsService,
    RevenueAnalyticsService,
    ReviewAnalyticsService,
    SupportAnalyticsService,
    GeographicAnalyticsService,
    DashboardService,
    ReportService,
    AlertService,
    AnalyticsSnapshotService,
    DateRangeFilterService,
  ],
  exports: [ActivityLogService, AnalyticsSnapshotService],
})
export class AnalyticsModule {}
