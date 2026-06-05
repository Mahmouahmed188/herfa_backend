# DTO Contracts

## CreateReviewDto

```typescript
class CreateReviewDto {
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
```

## UpdateReviewDto

```typescript
class UpdateReviewDto {
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
```

## ReviewResponseDto

```typescript
class ReviewResponseDto {
  @ApiProperty({ description: 'Review ID' })
  id: string;

  @ApiProperty({ description: 'Booking ID' })
  bookingId: string;

  @ApiProperty({ description: 'Customer ID' })
  customerId: string;

  @ApiProperty({ description: 'Customer name' })
  customerName: string;

  @ApiProperty({ description: 'Customer avatar URL' })
  customerAvatar?: string;

  @ApiProperty({ description: 'Provider ID' })
  providerId: string;

  @ApiProperty({ description: 'Rating 1-5' })
  rating: number;

  @ApiProperty({ description: 'Review comment' })
  comment?: string;

  @ApiProperty({ description: 'Whether review is editable' })
  isEditable: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}
```

## ReviewFilterDto (extends PaginationDto)

```typescript
class ReviewFilterDto extends PaginationDto {
  @IsOptional()
  @IsEnum(ReviewSortBy)
  @ApiPropertyOptional({ enum: ReviewSortBy, default: ReviewSortBy.DATE })
  sortBy?: ReviewSortBy;

  @IsOptional()
  @IsEnum(SortOrder)
  @ApiPropertyOptional({ enum: SortOrder, default: SortOrder.DESC })
  sortOrder?: SortOrder;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  @ApiPropertyOptional({ description: 'Filter by rating', example: 5 })
  rating?: number;
}

enum ReviewSortBy {
  DATE = 'date',
  RATING = 'rating',
}
```

## ProviderRatingStatsResponseDto

```typescript
class ProviderRatingStatsResponseDto {
  @ApiProperty({ description: 'Provider ID' })
  providerId: string;

  @ApiProperty({ description: 'Average rating (1.00-5.00)', example: 4.5 })
  averageRating: number;

  @ApiProperty({ description: 'Total number of reviews', example: 42 })
  totalReviews: number;

  @ApiProperty({ description: 'Number of 5-star reviews', example: 25 })
  fiveStarCount: number;

  @ApiProperty({ description: 'Number of 4-star reviews', example: 10 })
  fourStarCount: number;

  @ApiProperty({ description: 'Number of 3-star reviews', example: 5 })
  threeStarCount: number;

  @ApiProperty({ description: 'Number of 2-star reviews', example: 1 })
  twoStarCount: number;

  @ApiProperty({ description: 'Number of 1-star reviews', example: 1 })
  oneStarCount: number;
}
```

## ModerationLogResponseDto

```typescript
class ModerationLogResponseDto {
  @ApiProperty({ description: 'Log entry ID' })
  id: string;

  @ApiProperty({ description: 'Reviewed review ID' })
  reviewId: string;

  @ApiProperty({ description: 'Admin ID who performed action' })
  adminId: string;

  @ApiProperty({ description: 'Admin name' })
  adminName: string;

  @ApiProperty({ description: 'Action taken', example: 'removed' })
  action: string;

  @ApiProperty({ description: 'Reason for action' })
  reason?: string;

  @ApiProperty({ description: 'When action occurred' })
  createdAt: Date;
}
```

## API Response Examples

### Success: Create Review

```
POST /reviews
Authorization: Bearer <jwt>
{
  "bookingId": "550e8400-e29b-41d4-a716-446655440000",
  "rating": 4,
  "comment": "Great service, very professional!"
}

Response 201:
{
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "bookingId": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "770e8400-e29b-41d4-a716-446655440002",
    "providerId": "880e8400-e29b-41d4-a716-446655440003",
    "rating": 4,
    "comment": "Great service, very professional!",
    "isEditable": true,
    "createdAt": "2026-06-05T12:00:00.000Z",
    "updatedAt": "2026-06-05T12:00:00.000Z"
  },
  "timestamp": "2026-06-05T12:00:00.000Z"
}
```

### Error: Duplicate Review

```
Response 409:
{
  "statusCode": 409,
  "message": "You have already reviewed this booking",
  "error": "Conflict",
  "timestamp": "2026-06-05T12:00:01.000Z",
  "path": "/reviews"
}
```

### Error: Not Eligible (Booking Not Completed)

```
Response 400:
{
  "statusCode": 400,
  "message": "Can only review completed bookings",
  "error": "Bad Request",
  "timestamp": "2026-06-05T12:00:01.000Z",
  "path": "/reviews"
}
```

### Error: Edit Window Expired

```
Response 400:
{
  "statusCode": 400,
  "message": "Review can only be edited within 24 hours of submission",
  "error": "Bad Request",
  "timestamp": "2026-06-05T12:00:01.000Z",
  "path": "/reviews/660e8400-e29b-41d4-a716-446655440001"
}
```
