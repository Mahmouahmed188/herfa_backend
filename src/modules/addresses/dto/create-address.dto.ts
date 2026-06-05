import { IsString, IsNumber, IsInt, IsOptional, Min, Max, MaxLength, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'Address label', example: 'Home' })
  label: string;

  @IsString()
  @MinLength(5)
  @ApiProperty({ description: 'Full address text', example: '123 Main Street, Building 4' })
  fullAddress: string;

  @IsString()
  @ApiProperty({ description: 'Building number', example: '15A' })
  buildingNumber: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ description: 'Floor number', example: 3 })
  floorNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiPropertyOptional({ description: 'Apartment number', example: 12 })
  apartmentNumber?: number;

  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'City', example: 'Cairo' })
  city: string;

  @IsString()
  @MaxLength(100)
  @ApiProperty({ description: 'Area/district', example: 'Maadi' })
  area: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  @ApiProperty({ description: 'Latitude (WGS84)', example: 30.0444 })
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  @ApiProperty({ description: 'Longitude (WGS84)', example: 31.2357 })
  longitude: number;
}
