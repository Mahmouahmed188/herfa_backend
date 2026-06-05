import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class CurrentLocationDto {
  @ApiProperty({ example: 30.0444 })
  latitude: number;

  @ApiProperty({ example: 31.2357 })
  longitude: number;

  @ApiProperty({ example: '2026-06-05T10:05:00.000Z' })
  updatedAt: Date;
}

export class TrackingSessionResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  sessionId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  bookingId: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  providerId: string;

  @ApiProperty({ enum: ['inactive', 'active', 'paused', 'completed'] })
  status: string;

  @ApiPropertyOptional({ type: CurrentLocationDto })
  currentLocation?: CurrentLocationDto;

  @ApiPropertyOptional()
  distanceRemaining?: number;

  @ApiPropertyOptional()
  estimatedArrivalAt?: Date;

  @ApiPropertyOptional()
  startedAt?: Date;

  @ApiPropertyOptional()
  endedAt?: Date;
}

export class TrackingHistoryItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 30.0444 })
  latitude: number;

  @ApiProperty({ example: 31.2357 })
  longitude: number;

  @ApiPropertyOptional({ example: 12.5 })
  speed?: number;

  @ApiPropertyOptional({ example: 45 })
  heading?: number;

  @ApiProperty({ example: '2026-06-05T10:05:00.000Z' })
  recordedAt: Date;
}

export class PaginatedHistoryDto {
  @ApiProperty({ type: [TrackingHistoryItemDto] })
  items: TrackingHistoryItemDto[];

  @ApiProperty({ example: 150 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 50 })
  limit: number;

  @ApiProperty({ example: 3 })
  totalPages: number;
}

export class PauseResumeResponseDto {
  @ApiProperty()
  sessionId: string;

  @ApiProperty({ example: 'active' })
  previousStatus: string;

  @ApiProperty({ example: 'paused' })
  newStatus: string;

  @ApiProperty({ example: '2026-06-05T10:10:00.000Z' })
  timestamp: Date;
}

export class StartTrackingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingId: string;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: '2026-06-05T10:00:00.000Z' })
  startedAt: Date;
}

export class LocationUpdateResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: '2026-06-05T10:05:00.000Z' })
  recordedAt: Date;
}

export class AdminTrackingListDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  bookingId: string;

  @ApiProperty()
  providerId: string;

  @ApiProperty()
  customerId: string;

  @ApiProperty({ enum: ['inactive', 'active', 'paused', 'completed'] })
  status: string;

  @ApiPropertyOptional()
  startedAt?: Date;

  @ApiPropertyOptional()
  endedAt?: Date;

  @ApiProperty()
  createdAt: Date;
}

export class AdminTrackingDetailDto {
  @ApiProperty()
  session: TrackingSessionResponseDto;

  @ApiProperty({ type: PaginatedHistoryDto })
  locations: PaginatedHistoryDto;
}
