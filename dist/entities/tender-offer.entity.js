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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TenderOffer = exports.OfferStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const tender_entity_1 = require("./tender.entity");
var OfferStatus;
(function (OfferStatus) {
    OfferStatus["PENDING"] = "pending";
    OfferStatus["ACCEPTED"] = "accepted";
    OfferStatus["REJECTED"] = "rejected";
})(OfferStatus || (exports.OfferStatus = OfferStatus = {}));
let TenderOffer = class TenderOffer {
    id;
    tender;
    tenderId;
    provider;
    providerId;
    price;
    message;
    estimatedDays;
    status;
    createdAt;
    updatedAt;
};
exports.TenderOffer = TenderOffer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TenderOffer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => tender_entity_1.Tender, (tender) => tender.offers),
    (0, typeorm_1.JoinColumn)({ name: 'tender_id' }),
    __metadata("design:type", tender_entity_1.Tender)
], TenderOffer.prototype, "tender", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TenderOffer.prototype, "tenderId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'provider_id' }),
    __metadata("design:type", user_entity_1.User)
], TenderOffer.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TenderOffer.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], TenderOffer.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], TenderOffer.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], TenderOffer.prototype, "estimatedDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: OfferStatus.PENDING }),
    __metadata("design:type", String)
], TenderOffer.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], TenderOffer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], TenderOffer.prototype, "updatedAt", void 0);
exports.TenderOffer = TenderOffer = __decorate([
    (0, typeorm_1.Entity)('tender_offers')
], TenderOffer);
//# sourceMappingURL=tender-offer.entity.js.map