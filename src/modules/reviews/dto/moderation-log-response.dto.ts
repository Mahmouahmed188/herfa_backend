import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ModerationLogResponseDto {
  @ApiProperty({ description: 'Log entry ID' })
  id: string;

  @ApiProperty({ description: 'Reviewed review ID' })
  reviewId: string;

  @ApiProperty({ description: 'Admin ID who performed action' })
  adminId: string;

  @ApiProperty({ description: 'Admin name' })
  adminName: string;

  @ApiProperty({ description: 'Action taken', example: 'removed' })
  action: string;

  @ApiPropertyOptional({ description: 'Reason for action' })
  reason?: string;

  @ApiProperty({ description: 'When action occurred' })
  createdAt: Date;
}
