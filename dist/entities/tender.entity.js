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
exports.Tender = exports.TenderStatus = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const service_entity_1 = require("./service.entity");
const tender_offer_entity_1 = require("./tender-offer.entity");
var TenderStatus;
(function (TenderStatus) {
    TenderStatus["OPEN"] = "open";
    TenderStatus["CLOSED"] = "closed";
    TenderStatus["COMPLETED"] = "completed";
    TenderStatus["CANCELLED"] = "cancelled";
    TenderStatus["EXPIRED"] = "expired";
})(TenderStatus || (exports.TenderStatus = TenderStatus = {}));
let Tender = class Tender {
    id;
    user;
    userId;
    service;
    serviceId;
    title;
    description;
    status;
    budgetMin;
    budgetMax;
    address;
    deadline;
    images;
    acceptedOfferId;
    offers;
    createdAt;
    updatedAt;
};
exports.Tender = Tender;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Tender.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Tender.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tender.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_entity_1.Service),
    (0, typeorm_1.JoinColumn)({ name: 'service_id' }),
    __metadata("design:type", service_entity_1.Service)
], Tender.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tender.prototype, "serviceId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Tender.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], Tender.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: TenderStatus.OPEN }),
    __metadata("design:type", String)
], Tender.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Tender.prototype, "budgetMin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], Tender.prototype, "budgetMax", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tender.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Tender.prototype, "deadline", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Tender.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Tender.prototype, "acceptedOfferId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => tender_offer_entity_1.TenderOffer, (offer) => offer.tender),
    __metadata("design:type", Array)
], Tender.prototype, "offers", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Tender.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Tender.prototype, "updatedAt", void 0);
exports.Tender = Tender = __decorate([
    (0, typeorm_1.Entity)('tenders')
], Tender);
//# sourceMappingURL=tender.entity.js.map