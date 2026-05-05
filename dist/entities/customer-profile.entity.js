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
exports.CustomerProfile = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const job_entity_1 = require("./job.entity");
let CustomerProfile = class CustomerProfile {
    id;
    user;
    userId;
    defaultAddress;
    defaultLatitude;
    defaultLongitude;
    preferredLanguage;
    preferredCurrency;
    jobs;
    createdAt;
    updatedAt;
};
exports.CustomerProfile = CustomerProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], CustomerProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => user_entity_1.User, (user) => user.customerProfile),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], CustomerProfile.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomerProfile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomerProfile.prototype, "defaultAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal', precision: 10, scale: 8 }),
    __metadata("design:type", Number)
], CustomerProfile.prototype, "defaultLatitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: 'decimal', precision: 11, scale: 8 }),
    __metadata("design:type", Number)
], CustomerProfile.prototype, "defaultLongitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'en' }),
    __metadata("design:type", String)
], CustomerProfile.prototype, "preferredLanguage", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CustomerProfile.prototype, "preferredCurrency", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => job_entity_1.Job, (job) => job.customer),
    __metadata("design:type", Array)
], CustomerProfile.prototype, "jobs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], CustomerProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], CustomerProfile.prototype, "updatedAt", void 0);
exports.CustomerProfile = CustomerProfile = __decorate([
    (0, typeorm_1.Entity)('customer_profiles')
], CustomerProfile);
//# sourceMappingURL=customer-profile.entity.js.map