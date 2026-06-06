import { ApiProperty } from '@nestjs/swagger';

class ProviderRankingEntry {
  @ApiProperty({ example: 'uuid' })
  providerId: string;

  @ApiProperty({ example: 'ABC Services' })
  businessName: string;

  @ApiProperty({ example: 4.9 })
  rating: number;

  @ApiProperty({ example: 345 })
  totalJobs: number;
}

class VerificationCounts {
  @ApiProperty({ example: 300 })
  pending: number;

  @ApiProperty({ example: 2100 })
  verified: number;

  @ApiProperty({ example: 534 })
  rejected: number;
}

export class ProviderAnalyticsDto {
  @ApiProperty({ type: [ProviderRankingEntry] })
  topRatedProviders: ProviderRankingEntry[];

  @ApiProperty({ type: [ProviderRankingEntry] })
  mostBookedProviders: ProviderRankingEntry[];

  @ApiProperty({ type: [ProviderRankingEntry] })
  mostActiveProviders: ProviderRankingEntry[];

  @ApiProperty()
  verificationCounts: VerificationCounts;

  @ApiProperty({ example: 85.3 })
  completionRate: number;

  @ApiProperty({ example: 12.1 })
  cancellationRate: number;
}
