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
exports.ProviderApplication = void 0;
const typeorm_1 = require("typeorm");
const provider_profile_entity_1 = require("./provider-profile.entity");
const user_entity_1 = require("./user.entity");
let ProviderApplication = class ProviderApplication {
    id;
    user;
    userId;
    providerProfileId;
    providerProfile;
    status;
    businessName;
    businessDescription;
    nationalId;
    nationalIdImage;
    licenseImage;
    portfolioImages;
    notes;
    reviewedBy;
    reviewedAt;
    rejectionReason;
    createdAt;
    updatedAt;
};
exports.ProviderApplication = ProviderApplication;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProviderApplication.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ProviderApplication.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProviderApplication.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderApplication.prototype, "providerProfileId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => provider_profile_entity_1.ProviderProfile, (profile) => profile.applications, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'provider_profile_id' }),
    __metadata("design:type", provider_profile_entity_1.ProviderProfile)
], ProviderApplication.prototype, "providerProfile", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'pending' }),
    __metadata("design:type", String)
], ProviderApplication.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderApplication.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderApplication.prototype, "businessDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderApplication.prototype, "nationalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderApplication.prototype, "nationalIdImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderApplication.prototype, "licenseImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderApplication.prototype, "portfolioImages", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProviderApplication.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderApplication.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], ProviderApplication.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderApplication.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProviderApplication.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProviderApplication.prototype, "updatedAt", void 0);
exports.ProviderApplication = ProviderApplication = __decorate([
    (0, typeorm_1.Entity)('provider_applications')
], ProviderApplication);
//# sourceMappingURL=provider-application.entity.js.map