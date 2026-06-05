import { ApiProperty } from '@nestjs/swagger';

export class PauseResumeResponseDto {
  @ApiProperty({ description: 'Tracking session ID' })
  sessionId: string;

  @ApiProperty({ description: 'Previous status', example: 'active' })
  previousStatus: string;

  @ApiProperty({ description: 'New status', example: 'paused' })
  newStatus: string;

  @ApiProperty({ description: 'Timestamp of the change' })
  timestamp: Date;
}
