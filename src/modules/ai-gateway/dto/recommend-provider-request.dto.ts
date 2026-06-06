import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class RecommendProviderRequestDto {
  @ApiProperty({
    description: 'Description of the problem',
    example: 'Need a plumber to fix leaking pipes',
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Location for provider search',
    example: 'Amman',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Service category filter',
    example: 'plumbing',
  })
  @IsOptional()
  @IsString()
  category?: string;
}
