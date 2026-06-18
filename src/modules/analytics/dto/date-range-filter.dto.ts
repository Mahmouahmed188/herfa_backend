import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum DateRangePreset {
  TODAY = 'today',
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
}

export class DateRangeFilterDto {
  @ApiPropertyOptional({
    enum: DateRangePreset,
    description: 'Preset date range filter',
  })
  @IsOptional()
  @IsEnum(DateRangePreset)
  dateRange?: DateRangePreset;

  @ApiPropertyOptional({ description: 'Custom start date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Custom end date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
