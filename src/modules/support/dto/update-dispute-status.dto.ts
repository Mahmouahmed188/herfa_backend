import { IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { DisputeStatus } from '../enums/dispute-status.enum';

export class UpdateDisputeStatusDto {
  @ApiProperty({
    description: 'New dispute status',
    enum: DisputeStatus,
    example: DisputeStatus.UNDER_REVIEW,
  })
  @IsNotEmpty()
  @IsEnum(DisputeStatus)
  status: DisputeStatus;
}
