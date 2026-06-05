import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class ApproveVerificationDto {
  @ApiPropertyOptional({ description: 'Optional notes about the approval' })
  @IsOptional()
  @IsString()
  notes?: string;
}
