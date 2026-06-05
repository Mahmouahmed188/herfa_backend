import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SubmitVerificationDto {
  @ApiPropertyOptional({ description: 'Optional notes to include with submission' })
  @IsOptional()
  @IsString()
  notes?: string;
}
