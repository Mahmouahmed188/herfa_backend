import {
  IsString,
  IsOptional,
  IsEnum,
  IsUUID,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NotificationTargetAudience } from '../../../common/constants/notification.enums';
import { Type } from 'class-transformer';

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'Announcement title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Announcement message body' })
  @IsString()
  message: string;

  @ApiProperty({
    enum: NotificationTargetAudience,
    description: 'Target audience group',
  })
  @IsEnum(NotificationTargetAudience)
  targetAudience: NotificationTargetAudience;

  @ApiPropertyOptional({
    description: 'Required when targetAudience is "individual"',
  })
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

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;
}

export class AnnouncementQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
