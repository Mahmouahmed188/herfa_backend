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
exports.TendersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const tender_entity_1 = require("../../entities/tender.entity");
const tender_offer_entity_1 = require("../../entities/tender-offer.entity");
let TendersService = class TendersService {
    tenderRepository;
    offerRepository;
    constructor(tenderRepository, offerRepository) {
        this.tenderRepository = tenderRepository;
        this.offerRepository = offerRepository;
    }
    async createTender(userId, dto) {
        const tender = this.tenderRepository.create({
            userId,
            serviceId: dto.serviceId,
            title: dto.title,
            description: dto.description,
            budgetMin: dto.budgetMin,
            budgetMax: dto.budgetMax,
            address: dto.address,
            deadline: dto.deadline ? new Date(dto.deadline) : undefined,
            images: dto.images,
            status: tender_entity_1.TenderStatus.OPEN,
        });
        return this.tenderRepository.save(tender);
    }
    async findUserTenders(userId) {
        return this.tenderRepository.find({
            where: { userId },
            relations: ['service', 'service.category', 'offers'],
            order: { createdAt: 'DESC' },
        });
    }
    async findAllOpen() {
        return this.tenderRepository.find({
            where: { status: tender_entity_1.TenderStatus.OPEN },
            relations: ['service', 'service.category', 'user'],
            order: { createdAt: 'DESC' },
        });
    }
    async findById(id) {
        const tender = await this.tenderRepository.findOne({
            where: { id },
            relations: [
                'service',
                'service.category',
                'user',
                'offers',
                'offers.provider',
            ],
        });
        if (!tender)
            throw new common_1.NotFoundException('Tender not found');
        return tender;
    }
    async updateTender(id, userId, dto) {
        const tender = await this.tenderRepository.findOne({ where: { id } });
        if (!tender)
            throw new common_1.NotFoundException('Tender not found');
        if (tender.userId !== userId)
            throw new common_1.ForbiddenException('You can only update your own tenders');
        Object.assign(tender, dto);
        return this.tenderRepository.save(tender);
    }
    async cancelTender(id, userId) {
        const tender = await this.tenderRepository.findOne({ where: { id } });
        if (!tender)
            throw new common_1.NotFoundException('Tender not found');
        if (tender.userId !== userId)
            throw new common_1.ForbiddenException('Not your tender');
        if (tender.status !== tender_entity_1.TenderStatus.OPEN)
            throw new common_1.BadRequestException('Can only cancel open tenders');
        tender.status = tender_entity_1.TenderStatus.CANCELLED;
        return this.tenderRepository.save(tender);
    }
    async createOffer(tenderId, providerId, dto) {
        const tender = await this.tenderRepository.findOne({ where: { id: tenderId } });
        if (!tender)
            throw new common_1.NotFoundException('Tender not found');
        if (tender.status !== tender_entity_1.TenderStatus.OPEN)
            throw new common_1.BadRequestException('This tender is not accepting offers');
        const existing = await this.offerRepository.findOne({ where: { tenderId, providerId } });
        if (existing)
            throw new common_1.BadRequestException('You have already submitted an offer for this tender');
        const offer = this.offerRepository.create({
            tenderId,
            providerId,
            price: dto.price,
            message: dto.message,
            estimatedDays: dto.estimatedDays,
            status: tender_offer_entity_1.OfferStatus.PENDING,
        });
        return this.offerRepository.save(offer);
    }
    async getTenderOffers(tenderId) {
        return this.offerRepository.find({
            where: { tenderId },
            relations: ['provider'],
            order: { price: 'ASC' },
        });
    }
    async acceptOffer(offerId, userId) {
        const offer = await this.offerRepository.findOne({
            where: { id: offerId },
            relations: ['tender'],
        });
        if (!offer)
            throw new common_1.NotFoundException('Offer not found');
        if (offer.tender.userId !== userId)
            throw new common_1.ForbiddenException('Not authorized');
        if (offer.tender.status !== tender_entity_1.TenderStatus.OPEN)
            throw new common_1.BadRequestException('Tender is no longer open');
        offer.status = tender_offer_entity_1.OfferStatus.ACCEPTED;
        await this.offerRepository.save(offer);
        await this.offerRepository
            .createQueryBuilder()
            .update(tender_offer_entity_1.TenderOffer)
            .set({ status: tender_offer_entity_1.OfferStatus.REJECTED })
            .where('tenderId = :tenderId AND id != :offerId', { tenderId: offer.tenderId, offerId })
            .execute();
        await this.tenderRepository.update(offer.tenderId, {
            status: tender_entity_1.TenderStatus.COMPLETED,
            acceptedOfferId: offerId,
        });
        return offer;
    }
    async rejectOffer(offerId, userId) {
        const offer = await this.offerRepository.findOne({
            where: { id: offerId },
            relations: ['tender'],
        });
        if (!offer)
            throw new common_1.NotFoundException('Offer not found');
        if (offer.tender.userId !== userId)
            throw new common_1.ForbiddenException('Not authorized');
        offer.status = tender_offer_entity_1.OfferStatus.REJECTED;
        return this.offerRepository.save(offer);
    }
    async findProviderOffers(providerId) {
        return this.offerRepository.find({
            where: { providerId },
            relations: ['tender', 'tender.service', 'tender.user'],
            order: { createdAt: 'DESC' },
        });
    }
};
exports.TendersService = TendersService;
exports.TendersService = TendersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(tender_entity_1.Tender)),
    __param(1, (0, typeorm_1.InjectRepository)(tender_offer_entity_1.TenderOffer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TendersService);
//# sourceMappingURL=tenders.service.js.map