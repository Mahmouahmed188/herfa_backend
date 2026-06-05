import { IsOptional, IsInt, Min, Max, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @ApiPropertyOptional({ description: 'Updated rating 1-5', example: 5 })
  rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  @ApiPropertyOptional({ description: 'Updated comment', example: 'Even better after follow-up!' })
  comment?: string;
}
