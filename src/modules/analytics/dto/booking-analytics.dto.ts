import { ApiProperty } from '@nestjs/swagger';

class TimeSeriesEntry {
  @ApiProperty({ example: '2026-06-01' })
  date: string;

  @ApiProperty({ example: 245 })
  count: number;
}

class StatusDistribution {
  @ApiProperty({ example: 5.2 })
  pending: number;

  @ApiProperty({ example: 3.1 })
  accepted: number;

  @ApiProperty({ example: 8.3 })
  in_progress: number;

  @ApiProperty({ example: 71.4 })
  completed: number;

  @ApiProperty({ example: 12.0 })
  cancelled: number;
}

export class BookingAnalyticsDto {
  @ApiProperty({ example: 45678 })
  totalBookings: number;

  @ApiProperty({ type: [TimeSeriesEntry] })
  dailyBookings: TimeSeriesEntry[];

  @ApiProperty({ type: [TimeSeriesEntry] })
  weeklyBookings: TimeSeriesEntry[];

  @ApiProperty({ type: [TimeSeriesEntry] })
  monthlyBookings: TimeSeriesEntry[];

  @ApiProperty()
  statusDistribution: StatusDistribution;

  @ApiProperty({ example: 78.5 })
  conversionRate: number;

  @ApiProperty({ example: 125.5 })
  averageBookingValue: number;
}
