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
exports.ProvidersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const providers_service_1 = require("./providers.service");
const providers_dto_1 = require("./dto/providers.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ProvidersController = class ProvidersController {
    providersService;
    constructor(providersService) {
        this.providersService = providersService;
    }
    async apply(user, dto) {
        return this.providersService.apply(user.id, dto);
    }
    async getProfile(user) {
        return this.providersService.getProfile(user.id);
    }
    async updateProfile(user, dto) {
        return this.providersService.updateProfile(user.id, dto);
    }
    async setAvailability(user, dto) {
        return this.providersService.setAvailability(user.id, dto);
    }
    async updateLocation(user, dto) {
        return this.providersService.updateLocation(user.id, dto);
    }
    async addService(user, dto) {
        return this.providersService.addService(user.id, dto);
    }
    async removeService(user, serviceId) {
        return this.providersService.removeService(user.id, serviceId);
    }
    async listProviders(dto) {
        return this.providersService.searchProviders(dto);
    }
    async searchProviders(dto) {
        return this.providersService.searchProviders(dto);
    }
    async getProviderJobs(user, status) {
        return this.providersService.getProviderJobs(user.id, status);
    }
    async getProviderStats(user) {
        return this.providersService.getProviderStats(user.id);
    }
    async getProviderById(id) {
        return this.providersService.getProfileByIdOrUserId(id);
    }
};
exports.ProvidersController = ProvidersController;
__decorate([
    (0, common_1.Post)('apply'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Apply to become a provider' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, providers_dto_1.CreateProviderApplicationDto]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "apply", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get provider profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Patch)('profile'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update provider profile' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, providers_dto_1.UpdateProviderProfileDto]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Post)('availability'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Set provider availability' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, providers_dto_1.SetAvailabilityDto]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "setAvailability", null);
__decorate([
    (0, common_1.Post)('location'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Update provider location' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, providers_dto_1.UpdateLocationDto]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "updateLocation", null);
__decorate([
    (0, common_1.Post)('services'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Add service to provider' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, providers_dto_1.ProviderServiceDto]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "addService", null);
__decorate([
    (0, common_1.Delete)('services/:serviceId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Remove service from provider' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "removeService", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List all providers' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [providers_dto_1.SearchProvidersDto]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "listProviders", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search providers' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [providers_dto_1.SearchProvidersDto]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "searchProviders", null);
__decorate([
    (0, common_1.Get)('jobs'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get provider jobs' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "getProviderJobs", null);
__decorate([
    (0, common_1.Get)('stats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get provider stats' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "getProviderStats", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Get provider by ID (userId or profileId)' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProvidersController.prototype, "getProviderById", null);
exports.ProvidersController = ProvidersController = __decorate([
    (0, swagger_1.ApiTags)('Providers'),
    (0, common_1.Controller)('providers'),
    __metadata("design:paramtypes", [providers_service_1.ProvidersService])
], ProvidersController);
//# sourceMappingURL=providers.controller.js.map