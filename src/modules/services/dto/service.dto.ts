import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  IsArray,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateServiceDto {
  @ApiProperty({ description: 'Service title', example: 'Faucet Installation' })
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title: string;

  @ApiProperty({
    description: 'Service description',
    example: 'Professional faucet installation service',
  })
  @IsString()
  @MinLength(10)
  description: string;

  @ApiProperty({ description: 'Category ID', example: 'uuid' })
  @IsUUID()
  categoryId: string;

  @ApiProperty({ description: 'Base price', example: 150.0 })
  @IsNumber()
  @Min(0.01)
  basePrice: number;

  @ApiPropertyOptional({
    description: 'Currency',
    default: 'EGP',
    example: 'EGP',
  })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Estimated duration in minutes', example: 60 })
  @IsNumber()
  @Min(1)
  estimatedDurationMinutes: number;
}

export class UpdateServiceDto {
  @ApiPropertyOptional({
    description: 'Service title',
    example: 'Updated Faucet Installation',
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ description: 'Service description' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  description?: string;

  @ApiPropertyOptional({ description: 'Base price', example: 180.0 })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  basePrice?: number;

  @ApiPropertyOptional({ description: 'Currency', default: 'EGP' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({
    description: 'Estimated duration in minutes',
    example: 90,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  estimatedDurationMinutes?: number;

  @ApiPropertyOptional({ description: 'Whether the service is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class ServiceFilterDto {
  @ApiPropertyOptional({ description: 'Filter by category ID' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ description: 'Filter by provider ID' })
  @IsOptional()
  @IsUUID()
  providerId?: string;

  @ApiPropertyOptional({ description: 'Minimum price', example: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price', example: 500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({
    description: 'Search by title keyword',
    example: 'plumbing',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Sort field', default: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ description: 'Sort order', default: 'DESC' })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class ToggleStatusDto {
  @ApiProperty({ description: 'New active status', example: false })
  @IsBoolean()
  isActive: boolean;
}

export class ServiceImageDto {
  @ApiProperty({
    description: 'Image URL',
    example: 'https://example.com/image.jpg',
  })
  @IsString()
  imageUrl: string;

  @ApiPropertyOptional({
    description: 'Whether this is the primary image',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;
}

export class SetPrimaryImageDto {
  @ApiProperty({ description: 'Image ID to set as primary' })
  @IsUUID()
  imageId: string;
}
