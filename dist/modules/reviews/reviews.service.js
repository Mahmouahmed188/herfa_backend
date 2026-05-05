"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("../../entities/review.entity");
const job_entity_1 = require("../../entities/job.entity");
const user_enums_1 = require("../../common/constants/user.enums");
let ReviewsService = class ReviewsService {
    reviewRepository;
    jobRepository;
    constructor(reviewRepository, jobRepository) {
        this.reviewRepository = reviewRepository;
        this.jobRepository = jobRepository;
    }
    async create(reviewerId, jobId, type, rating, comment) {
        const job = await this.jobRepository.findOne({ where: { id: jobId } });
        if (!job)
            throw new common_1.NotFoundException('Job not found');
        if (job.status !== user_enums_1.JobStatus.COMPLETED)
            throw new common_1.BadRequestException('Can only review completed jobs');
        const revieweeId = type === user_enums_1.ReviewType.CUSTOMER_TO_PROVIDER ? job.providerId : job.customerId;
        if (!revieweeId)
            throw new common_1.BadRequestException('Job does not have a reviewee');
        const existingReview = await this.reviewRepository.findOne({
            where: { jobId, reviewerId, type },
        });
        if (existingReview)
            throw new common_1.BadRequestException('You have already reviewed this job');
        const review = this.reviewRepository.create({
            jobId,
            reviewerId,
            revieweeId,
            type,
            rating,
            comment,
        });
        const saved = await this.reviewRepository.save(review);
        await this.updateProviderRating(job.providerId);
        return saved;
    }
    async getReviewsForProvider(providerId, page = 1, limit = 20) {
        const [reviews, total] = await this.reviewRepository.findAndCount({
            where: { revieweeId: providerId, type: user_enums_1.ReviewType.CUSTOMER_TO_PROVIDER, isVisible: true },
            relations: ['reviewer', 'job'],
            order: { createdAt: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data: reviews, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
    }
    async updateProviderRating(providerId) {
        const result = await this.reviewRepository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'avg')
            .where('review.revieweeId = :providerId', { providerId })
            .andWhere('review.type = :type', { type: user_enums_1.ReviewType.CUSTOMER_TO_PROVIDER })
            .getRawOne();
        if (result && result.avg) {
            await this.jobRepository.manager.query(`UPDATE provider_profiles SET rating = $1 WHERE user_id = $2`, [parseFloat(result.avg).toFixed(2), providerId]);
        }
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(job_entity_1.Job)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map