import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AnalyticsSnapshot } from '../../../entities/analytics-snapshot.entity';
import { UserAnalyticsService } from './user-analytics.service';
import { ProviderAnalyticsService } from './provider-analytics.service';
import { BookingAnalyticsService } from './booking-analytics.service';
import { RevenueAnalyticsService } from './revenue-analytics.service';
import { ReviewAnalyticsService } from './review-analytics.service';
import { SupportAnalyticsService } from './support-analytics.service';
import { GeographicAnalyticsService } from './geographic-analytics.service';
import { DashboardService } from './dashboard.service';

type SnapshotType = 'daily' | 'weekly' | 'monthly';

@Injectable()
export class AnalyticsSnapshotService {
  private readonly logger = new Logger(AnalyticsSnapshotService.name);

  constructor(
    @InjectRepository(AnalyticsSnapshot)
    private snapshotRepository: Repository<AnalyticsSnapshot>,
    private dashboardService: DashboardService,
    private userAnalyticsService: UserAnalyticsService,
    private providerAnalyticsService: ProviderAnalyticsService,
    private bookingAnalyticsService: BookingAnalyticsService,
    private revenueAnalyticsService: RevenueAnalyticsService,
    private reviewAnalyticsService: ReviewAnalyticsService,
    private supportAnalyticsService: SupportAnalyticsService,
    private geographicAnalyticsService: GeographicAnalyticsService,
  ) {}

  async computeAndStore(snapshotType: SnapshotType): Promise<AnalyticsSnapshot> {
    this.logger.log(`Computing ${snapshotType} analytics snapshot...`);

    const [dashboard, userAnalytics, providerAnalytics, bookingAnalytics, revenueAnalytics, reviewAnalytics, supportAnalytics, geographicAnalytics] =
      await Promise.all([
        this.dashboardService.getOverview(),
        this.userAnalyticsService.getAnalytics(),
        this.providerAnalyticsService.getAnalytics(),
        this.bookingAnalyticsService.getAnalytics(),
        this.revenueAnalyticsService.getAnalytics(),
        this.reviewAnalyticsService.getAnalytics(),
        this.supportAnalyticsService.getAnalytics(),
        this.geographicAnalyticsService.getAnalytics(),
      ]);

    const snapshot = this.snapshotRepository.create({
      snapshotType,
      data: {
        dashboard,
        userAnalytics,
        providerAnalytics,
        bookingAnalytics,
        revenueAnalytics,
        reviewAnalytics,
        supportAnalytics,
        geographicAnalytics,
        period: dashboard.period,
      },
    });

    const saved = await this.snapshotRepository.save(snapshot);
    this.logger.log(`${snapshotType} snapshot stored (id: ${saved.id})`);
    return saved;
  }

  async getLatest(snapshotType: SnapshotType): Promise<AnalyticsSnapshot | null> {
    return this.snapshotRepository.findOne({
      where: { snapshotType },
      order: { generatedAt: 'DESC' },
    });
  }
}
