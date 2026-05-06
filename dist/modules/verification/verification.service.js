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
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const technician_verification_entity_1 = require("../../entities/technician-verification.entity");
const user_entity_1 = require("../../entities/user.entity");
let VerificationService = class VerificationService {
    verificationRepository;
    userRepository;
    constructor(verificationRepository, userRepository) {
        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
    }
    async submitVerification(userId, data) {
        const existing = await this.verificationRepository.findOne({
            where: { userId, status: technician_verification_entity_1.VerificationStatus.PENDING },
        });
        if (existing) {
            throw new common_1.BadRequestException('You already have a pending verification request.');
        }
        const verification = this.verificationRepository.create({
            userId,
            ...data,
            status: technician_verification_entity_1.VerificationStatus.PENDING,
        });
        const saved = await this.verificationRepository.save(verification);
        await this.userRepository.update(userId, { status: 'pending' });
        return saved;
    }
    async getStatus(userId) {
        const verification = await this.verificationRepository.findOne({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
        if (!verification) {
            return { status: 'unverified' };
        }
        return verification;
    }
    async reviewVerification(id, status, adminNote) {
        const verification = await this.verificationRepository.findOne({
            where: { id },
        });
        if (!verification) {
            throw new common_1.NotFoundException('Verification request not found');
        }
        verification.status = status;
        verification.adminNote = adminNote;
        await this.verificationRepository.save(verification);
        let userStatus = 'unverified';
        if (status === technician_verification_entity_1.VerificationStatus.APPROVED)
            userStatus = 'approved';
        if (status === technician_verification_entity_1.VerificationStatus.REJECTED)
            userStatus = 'rejected';
        await this.userRepository.update(verification.userId, { status: userStatus });
        return verification;
    }
};
exports.VerificationService = VerificationService;
exports.VerificationService = VerificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(technician_verification_entity_1.TechnicianVerification)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], VerificationService);
//# sourceMappingURL=verification.service.js.map