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
exports.ProviderProfile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const user_enums_1 = require("../common/constants/user.enums");
const provider_application_entity_1 = require("./provider-application.entity");
const job_assignment_entity_1 = require("./job-assignment.entity");
const provider_service_entity_1 = require("./provider-service.entity");
let ProviderProfile = class ProviderProfile {
    id;
    user;
    userId;
    businessName;
    businessDescription;
    address;
    latitude;
    longitude;
    isAvailable;
    serviceRadiusKm;
    verificationStatus;
    nationalId;
    nationalIdImage;
    licenseImage;
    profileImage;
    portfolioImages;
    bio;
    rating;
    totalJobsCompleted;
    totalEarnings;
    responseTimeMinutes;
    applications;
    jobAssignments;
    services;
    workingHours;
    createdAt;
    updatedAt;
};
exports.ProviderProfile = ProviderProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProviderProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.providerProfile),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], ProviderProfile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "businessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "businessDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal', precision: 10, scale: 8 }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal', precision: 11, scale: 8 }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ProviderProfile.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "serviceRadiusKm", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: user_enums_1.ProviderVerificationStatus,
        default: user_enums_1.ProviderVerificationStatus.PENDING,
    }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "verificationStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "nationalId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "nationalIdImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "licenseImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "profileImage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "portfolioImages", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal', precision: 3, scale: 2 }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "totalJobsCompleted", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "totalEarnings", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], ProviderProfile.prototype, "responseTimeMinutes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => provider_application_entity_1.ProviderApplication, (app) => app.providerProfile),
    __metadata("design:type", Array)
], ProviderProfile.prototype, "applications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_assignment_entity_1.JobAssignment, (assignment) => assignment.provider),
    __metadata("design:type", Array)
], ProviderProfile.prototype, "jobAssignments", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => provider_service_entity_1.ProviderService, (ps) => ps.provider),
    __metadata("design:type", Array)
], ProviderProfile.prototype, "services", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProviderProfile.prototype, "workingHours", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProviderProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProviderProfile.prototype, "updatedAt", void 0);
exports.ProviderProfile = ProviderProfile = __decorate([
    (0, typeorm_1.Entity)('provider_profiles')
], ProviderProfile);
//# sourceMappingURL=provider-profile.entity.js.map