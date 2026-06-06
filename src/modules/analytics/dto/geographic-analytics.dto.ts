import { ApiProperty } from '@nestjs/swagger';

class CityEntry {
  @ApiProperty({ example: 'Cairo' })
  city: string;

  @ApiProperty({ example: 5000 })
  count: number;
}

class CityRevenueEntry {
  @ApiProperty({ example: 'Cairo' })
  city: string;

  @ApiProperty({ example: 500000 })
  revenue: number;
}

export class GeographicAnalyticsDto {
  @ApiProperty({ type: [CityEntry] })
  usersByCity: CityEntry[];

  @ApiProperty({ type: [CityEntry] })
  providersByCity: CityEntry[];

  @ApiProperty({ type: [CityEntry] })
  bookingsByCity: CityEntry[];

  @ApiProperty({ type: [CityRevenueEntry] })
  revenueByCity: CityRevenueEntry[];
}
