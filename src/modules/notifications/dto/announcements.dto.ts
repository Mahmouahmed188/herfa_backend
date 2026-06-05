import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationTargetAudience } from '../../../common/constants/notification.enums';

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'Announcement title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Announcement message body' })
  @IsString()
  message: string;

  @ApiProperty({ enum: NotificationTargetAudience, description: 'Target audience group' })
  @IsEnum(NotificationTargetAudience)
  targetAudience: NotificationTargetAudience;

  @ApiPropertyOptional({ description: 'Required when targetAudience is "individual"' })
  @IsOptional()
  @IsUUID()
  targetUserId?: string;
}

export class AnnouncementResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'System Maintenance' })
  title: string;

  @ApiProperty({ example: 'The system will be down for maintenance tonight.' })
  message: string;

  @ApiProperty({ enum: NotificationTargetAudience })
  targetAudience: NotificationTargetAudience;

  @ApiPropertyOptional()
  targetUserId?: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({ example: '2026-06-05T10:00:00.000Z' })
  createdAt: Date;
}

export class AnnouncementListResponseDto {
  @ApiProperty({ type: [AnnouncementResponseDto] })
  items: AnnouncementResponseDto[];

  @ApiProperty()
  total: number;
}
