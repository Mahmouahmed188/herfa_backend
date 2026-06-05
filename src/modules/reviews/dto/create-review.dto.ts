import { IsUUID, IsInt, Min, Max, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @IsUUID()
  @ApiProperty({ description: 'Booking ID (must be completed and owned by customer)' })
  bookingId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  @ApiProperty({ description: 'Rating 1-5', example: 4 })
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ description: 'Optional comment', example: 'Great service!' })
  comment?: string;
}
