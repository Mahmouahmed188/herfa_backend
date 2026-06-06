import { ApiProperty } from '@nestjs/swagger';

export class DashboardOverviewDto {
  @ApiProperty({ example: 15234 })
  totalUsers: number;

  @ApiProperty({ example: 12300 })
  totalCustomers: number;

  @ApiProperty({ example: 2934 })
  totalProviders: number;

  @ApiProperty({ example: 2100 })
  verifiedProviders: number;

  @ApiProperty({ example: 1800 })
  activeProviders: number;

  @ApiProperty({ example: 45678 })
  totalBookings: number;

  @ApiProperty({ example: 1234 })
  activeBookings: number;

  @ApiProperty({ example: 38900 })
  completedBookings: number;

  @ApiProperty({ example: 5544 })
  cancelledBookings: number;

  @ApiProperty({ example: 1234567.89 })
  totalRevenue: number;

  @ApiProperty({ example: 234 })
  pendingPayments: number;

  @ApiProperty({ example: 45 })
  openSupportTickets: number;

  @ApiProperty({ example: 12 })
  activeDisputes: number;

  @ApiProperty({ example: { startDate: '2026-06-01', endDate: '2026-06-06' } })
  period: { startDate: string; endDate: string };
}
