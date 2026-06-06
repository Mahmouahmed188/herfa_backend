import { ApiProperty } from '@nestjs/swagger';

export class ActivityLogDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'uuid' })
  adminId: string;

  @ApiProperty({ example: 'dashboard_view' })
  action: string;

  @ApiProperty({ example: 'Dashboard', nullable: true })
  entityType: string;

  @ApiProperty({ example: null, nullable: true })
  entityId: string;

  @ApiProperty({ example: { section: 'overview', dateRange: 'last_7_days' }, nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ example: '2026-06-06T10:00:00Z' })
  createdAt: Date;
}
