import { Injectable, CanActivate, ExecutionContext, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reflector } from '@nestjs/core';
import { Review } from '../../../entities/review.entity';

@Injectable()
export class ReviewOwnershipGuard implements CanActivate {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const reviewId = request.params.id;

    if (!reviewId) {
      return true;
    }

    const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    if (user.role === 'admin' || user.role === 'super_admin') {
      return true;
    }

    if (review.customerId !== user.id) {
      throw new ForbiddenException('You can only manage your own reviews');
    }

    request.review = review;
    return true;
  }
}
