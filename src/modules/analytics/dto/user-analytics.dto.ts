import { ApiProperty } from '@nestjs/swagger';

export class UserAnalyticsDto {
  @ApiProperty({ example: 45 })
  newUsersToday: number;

  @ApiProperty({ example: 312 })
  newUsersThisWeek: number;

  @ApiProperty({ example: 1345 })
  newUsersThisMonth: number;

  @ApiProperty({ example: 2.5 })
  customerGrowthRate: number;

  @ApiProperty({ example: 1.8 })
  providerGrowthRate: number;

  @ApiProperty({ example: 8900 })
  activeUsers: number;

  @ApiProperty({ example: 6334 })
  inactiveUsers: number;
}
