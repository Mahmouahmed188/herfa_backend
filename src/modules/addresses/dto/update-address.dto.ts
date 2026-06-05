import { IsString, IsNumber, IsInt, IsOptional, Min, Max, MaxLength, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateAddressDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'Address label', example: 'Work' })
  label?: string;

  @IsOptional()
  @IsString()
  @MinLength(5)
  @ApiPropertyOptional({ description: 'Full address text', example: '456 Business Ave, Tower 2' })
  fullAddress?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({ description: 'Building number', example: '22B' })
  buildingNumber?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ description: 'Floor number', example: 15 })
  floorNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ description: 'Apartment number', example: 8 })
  apartmentNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'City', example: 'Alexandria' })
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @ApiPropertyOptional({ description: 'Area/district', example: 'San Stefano' })
  area?: string;

  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @ApiPropertyOptional({ description: 'Latitude (WGS84)', example: 31.2001 })
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @ApiPropertyOptional({ description: 'Longitude (WGS84)', example: 29.9187 })
  longitude?: number;
}
