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
exports.ProviderService = void 0;
const typeorm_1 = require("typeorm");
const provider_profile_entity_1 = require("./provider-profile.entity");
const service_entity_1 = require("./service.entity");
let ProviderService = class ProviderService {
    id;
    provider;
    providerId;
    service;
    serviceId;
    price;
    priceUnit;
    isActive;
    createdAt;
    updatedAt;
};
exports.ProviderService = ProviderService;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProviderService.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => provider_profile_entity_1.ProviderProfile, (profile) => profile.services, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'provider_id' }),
    __metadata("design:type", provider_profile_entity_1.ProviderProfile)
], ProviderService.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProviderService.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => service_entity_1.Service, (service) => service.providerServices),
    (0, typeorm_1.JoinColumn)({ name: 'service_id' }),
    __metadata("design:type", service_entity_1.Service)
], ProviderService.prototype, "service", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProviderService.prototype, "serviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2 }),
    __metadata("design:type", Number)
], ProviderService.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderService.prototype, "priceUnit", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], ProviderService.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProviderService.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProviderService.prototype, "updatedAt", void 0);
exports.ProviderService = ProviderService = __decorate([
    (0, typeorm_1.Entity)('provider_services'),
    (0, typeorm_1.Index)(['providerId', 'serviceId'], { unique: true })
], ProviderService);
//# sourceMappingURL=provider-service.entity.js.map