import { ApiProperty } from '@nestjs/swagger';

export class SupportAnalyticsDto {
  @ApiProperty({ example: 45 })
  openTickets: number;

  @ApiProperty({ example: 892 })
  resolvedTickets: number;

  @ApiProperty({ example: 24.5 })
  averageResolutionHours: number;

  @ApiProperty({ example: 12 })
  activeDisputes: number;

  @ApiProperty({ example: 78.0 })
  disputeResolutionRate: number;
}
