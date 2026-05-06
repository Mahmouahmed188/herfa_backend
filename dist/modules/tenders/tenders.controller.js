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
exports.TendersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const tenders_service_1 = require("./tenders.service");
const tenders_dto_1 = require("./dto/tenders.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const verification_guard_1 = require("../../common/guards/verification.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let TendersController = class TendersController {
    tendersService;
    constructor(tendersService) {
        this.tendersService = tendersService;
    }
    async createTender(user, dto) {
        return this.tendersService.createTender(user.id, dto);
    }
    async getMyTenders(user) {
        return this.tendersService.findUserTenders(user.id);
    }
    async getOpenTenders() {
        return this.tendersService.findAllOpen();
    }
    async getTender(id) {
        return this.tendersService.findById(id);
    }
    async updateTender(id, user, dto) {
        return this.tendersService.updateTender(id, user.id, dto);
    }
    async cancelTender(id, user) {
        return this.tendersService.cancelTender(id, user.id);
    }
    async createOffer(tenderId, user, dto) {
        return this.tendersService.createOffer(tenderId, user.id, dto);
    }
    async getTenderOffers(tenderId) {
        return this.tendersService.getTenderOffers(tenderId);
    }
    async acceptOffer(offerId, user) {
        return this.tendersService.acceptOffer(offerId, user.id);
    }
    async rejectOffer(offerId, user) {
        return this.tendersService.rejectOffer(offerId, user.id);
    }
    async getMyOffers(user) {
        return this.tendersService.findProviderOffers(user.id);
    }
};
exports.TendersController = TendersController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a tender/service request' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, tenders_dto_1.CreateTenderDto]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "createTender", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user tenders' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "getMyTenders", null);
__decorate([
    (0, common_1.Get)('open'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all open tenders (for providers)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "getOpenTenders", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get tender by ID' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "getTender", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update tender' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, tenders_dto_1.UpdateTenderDto]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "updateTender", null);
__decorate([
    (0, common_1.Post)(':id/cancel'),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel a tender' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "cancelTender", null);
__decorate([
    (0, common_1.Post)(':id/offers'),
    (0, swagger_1.ApiOperation)({ summary: 'Submit an offer on a tender' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, tenders_dto_1.CreateOfferDto]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "createOffer", null);
__decorate([
    (0, common_1.Get)(':id/offers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all offers for a tender' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "getTenderOffers", null);
__decorate([
    (0, common_1.Patch)('offers/:offerId/accept'),
    (0, swagger_1.ApiOperation)({ summary: 'Accept an offer' }),
    __param(0, (0, common_1.Param)('offerId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "acceptOffer", null);
__decorate([
    (0, common_1.Patch)('offers/:offerId/reject'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject an offer' }),
    __param(0, (0, common_1.Param)('offerId')),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "rejectOffer", null);
__decorate([
    (0, common_1.Get)('technician/my-offers'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all offers submitted by technician' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TendersController.prototype, "getMyOffers", null);
exports.TendersController = TendersController = __decorate([
    (0, swagger_1.ApiTags)('Tenders'),
    (0, common_1.Controller)('tenders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, verification_guard_1.VerificationGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [tenders_service_1.TendersService])
], TendersController);
//# sourceMappingURL=tenders.controller.js.map