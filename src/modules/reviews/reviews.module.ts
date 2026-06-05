import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewsController } from './reviews.controller';
import { ProviderReviewsController } from './provider-reviews.controller';
import { PublicReviewsController } from './public-reviews.controller';
import { AdminReviewsController } from './admin-reviews.controller';
import { ReviewsService } from './reviews.service';
import { Review } from '../../entities/review.entity';
import { ProviderRatingStats } from '../../entities/provider-rating-stats.entity';
import { ModerationLog } from '../../entities/moderation-log.entity';
import { Booking } from '../../entities/booking.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, ProviderRatingStats, ModerationLog, Booking, ProviderProfile]),
    BookingsModule,
  ],
  controllers: [ReviewsController, ProviderReviewsController, PublicReviewsController, AdminReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}