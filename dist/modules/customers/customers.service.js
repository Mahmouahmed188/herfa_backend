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
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_profile_entity_1 = require("../../entities/customer-profile.entity");
let CustomersService = class CustomersService {
    customerProfileRepository;
    constructor(customerProfileRepository) {
        this.customerProfileRepository = customerProfileRepository;
    }
    async getProfile(userId) {
        const profile = await this.customerProfileRepository.findOne({
            where: { userId },
            relations: ['user'],
        });
        if (!profile)
            throw new common_1.NotFoundException('Customer profile not found');
        return profile;
    }
    async updateProfile(userId, data) {
        const profile = await this.customerProfileRepository.findOne({ where: { userId } });
        if (!profile)
            throw new common_1.NotFoundException('Customer profile not found');
        Object.assign(profile, data);
        return this.customerProfileRepository.save(profile);
    }
    async setDefaultLocation(userId, latitude, longitude, address) {
        const profile = await this.customerProfileRepository.findOne({ where: { userId } });
        if (!profile)
            throw new common_1.NotFoundException('Customer profile not found');
        profile.defaultLatitude = latitude;
        profile.defaultLongitude = longitude;
        profile.defaultAddress = address;
        return this.customerProfileRepository.save(profile);
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_profile_entity_1.CustomerProfile)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customers.service.js.map