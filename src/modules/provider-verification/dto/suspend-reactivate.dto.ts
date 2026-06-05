import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SuspendProviderDto {
  @ApiProperty({ description: 'Reason for suspension' })
  @IsString()
  @IsNotEmpty()
  reason: string;

  @ApiPropertyOptional({ description: 'Optional internal notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class ReactivateProviderDto {
  @ApiPropertyOptional({ description: 'Optional notes about reactivation' })
  @IsOptional()
  @IsString()
  notes?: string;
}
