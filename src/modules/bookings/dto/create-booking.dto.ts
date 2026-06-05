import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  Matches,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ description: 'Service ID', example: 'uuid' })
  @IsUUID()
  serviceId: string;

  @ApiProperty({ description: 'Provider ID', example: 'uuid' })
  @IsUUID()
  providerId: string;

  @ApiProperty({ description: 'Customer address line', example: '123 Main St' })
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  addressLine: string;

  @ApiProperty({ description: 'City', example: 'Cairo' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ description: 'Latitude', example: 30.0444 })
  @IsOptional()
  @IsString()
  latitude?: string;

  @ApiPropertyOptional({ description: 'Longitude', example: 31.2357 })
  @IsOptional()
  @IsString()
  longitude?: string;

  @ApiProperty({
    description: 'Preferred service date (YYYY-MM-DD)',
    example: '2026-06-15',
  })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({
    description: 'Preferred service time (HH:MM)',
    example: '10:00',
  })
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, {
    message: 'Time must be in HH:MM 24-hour format',
  })
  scheduledTime: string;

  @ApiPropertyOptional({
    description: 'Optional notes for the provider',
    example: 'Please bring equipment',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
