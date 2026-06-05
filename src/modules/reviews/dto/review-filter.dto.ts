import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto, SortOrder } from '../../../common/dto/pagination.dto';

export enum ReviewSortBy {
  DATE = 'date',
  RATING = 'rating',
}

export class ReviewFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ReviewSortBy)
  @ApiPropertyOptional({ enum: ReviewSortBy, default: ReviewSortBy.DATE })
  sortBy?: ReviewSortBy = ReviewSortBy.DATE;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  sortOrder?: SortOrder = SortOrder.DESC;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @ApiPropertyOptional({ description: 'Filter by rating', example: 5 })
  rating?: number;
}
