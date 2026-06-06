import { ApiProperty } from '@nestjs/swagger';

class RevenueTimeSeriesEntry {
  @ApiProperty({ example: '2026-06-01' })
  date: string;

  @ApiProperty({ example: 45678.9 })
  amount: number;
}

class CategoryRevenueEntry {
  @ApiProperty({ example: 'Cleaning' })
  category: string;

  @ApiProperty({ example: 456789.12 })
  amount: number;
}

class ProviderRevenueEntry {
  @ApiProperty({ example: 'uuid' })
  providerId: string;

  @ApiProperty({ example: 'ABC Services' })
  businessName: string;

  @ApiProperty({ example: 123456.78 })
  amount: number;
}

export class RevenueAnalyticsDto {
  @ApiProperty({ example: 1234567.89 })
  totalRevenue: number;

  @ApiProperty({ type: [RevenueTimeSeriesEntry] })
  dailyRevenue: RevenueTimeSeriesEntry[];

  @ApiProperty({ type: [RevenueTimeSeriesEntry] })
  weeklyRevenue: RevenueTimeSeriesEntry[];

  @ApiProperty({ type: [RevenueTimeSeriesEntry] })
  monthlyRevenue: RevenueTimeSeriesEntry[];

  @ApiProperty({ type: [CategoryRevenueEntry] })
  revenueByCategory: CategoryRevenueEntry[];

  @ApiProperty({ type: [ProviderRevenueEntry] })
  revenueByProvider: ProviderRevenueEntry[];

  @ApiProperty({ example: 23456.78 })
  totalRefunds: number;

  @ApiProperty({ example: 89 })
  refundCount: number;

  @ApiProperty({ example: 123 })
  failedPaymentCount: number;

  @ApiProperty({ example: 45678.9 })
  failedPaymentVolume: number;
}
