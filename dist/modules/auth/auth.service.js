"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const user_entity_1 = require("../../entities/user.entity");
const customer_profile_entity_1 = require("../../entities/customer-profile.entity");
const refresh_token_entity_1 = require("../../entities/refresh-token.entity");
const user_enums_1 = require("../../common/constants/user.enums");
let AuthService = class AuthService {
    userRepository;
    customerProfileRepository;
    refreshTokenRepository;
    jwtService;
    configService;
    constructor(userRepository, customerProfileRepository, refreshTokenRepository, jwtService, configService) {
        this.userRepository = userRepository;
        this.customerProfileRepository = customerProfileRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(registerDto) {
        const existingUser = await this.userRepository.findOne({
            where: [
                { email: registerDto.email },
                { phone: registerDto.phone },
            ],
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email or phone already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 12);
        const user = this.userRepository.create({
            ...registerDto,
            password: hashedPassword,
            role: registerDto.role || user_enums_1.UserRole.CUSTOMER,
            status: user_enums_1.UserStatus.PENDING,
        });
        const savedUser = await this.userRepository.save(user);
        if (savedUser.role === user_enums_1.UserRole.CUSTOMER) {
            const customerProfile = this.customerProfileRepository.create({
                userId: savedUser.id,
            });
            await this.customerProfileRepository.save(customerProfile);
        }
        return this.generateTokens(savedUser);
    }
    async login(loginDto) {
        const user = await this.userRepository.findOne({
            where: [
                { email: loginDto.identifier },
                { phone: loginDto.identifier },
            ],
            relations: ['customerProfile', 'providerProfile'],
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (user.status === user_enums_1.UserStatus.SUSPENDED) {
            throw new common_1.UnauthorizedException('Account is suspended');
        }
        if (loginDto.fcmToken) {
            user.fcmToken = loginDto.fcmToken;
            await this.userRepository.save(user);
        }
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);
        return this.generateTokens(user);
    }
    async refreshToken(refreshTokenDto) {
        const refreshToken = await this.refreshTokenRepository.findOne({
            where: { token: refreshTokenDto.refreshToken },
            relations: ['user'],
        });
        if (!refreshToken || refreshToken.isRevoked) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (new Date() > refreshToken.expiresAt) {
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        const user = refreshToken.user;
        if (user.status !== user_enums_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('User is not active');
        }
        await this.refreshTokenRepository.update(refreshToken.id, {
            isRevoked: true,
            revokedAt: new Date(),
        });
        return this.generateTokens(user);
    }
    async logout(userId, refreshToken) {
        if (refreshToken) {
            await this.refreshTokenRepository.update({ token: refreshToken, userId }, { isRevoked: true, revokedAt: new Date() });
        }
        await this.refreshTokenRepository.update({ userId, isRevoked: false }, { isRevoked: true, revokedAt: new Date() });
        return { message: 'Logged out successfully' };
    }
    async forgotPassword(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            return { message: 'If the email exists, a reset link will be sent' };
        }
        const resetToken = (0, uuid_1.v4)();
        const resetTokenExpiry = new Date(Date.now() + 3600000);
        await this.userRepository.update(user.id, {
            resetToken,
            resetTokenExpiry,
        });
        return { message: 'Password reset link sent', resetToken };
    }
    async resetPassword(token, newPassword) {
        const user = await this.userRepository.findOne({
            where: { resetToken: token },
        });
        if (!user) {
            throw new common_1.BadRequestException('Invalid reset token');
        }
        if (user.resetTokenExpiry && new Date() > user.resetTokenExpiry) {
            throw new common_1.BadRequestException('Reset token expired');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await this.userRepository.update(user.id, {
            password: hashedPassword,
            resetToken: undefined,
            resetTokenExpiry: undefined,
        });
        return { message: 'Password reset successful' };
    }
    async changePassword(userId, currentPassword, newPassword) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 12);
        await this.userRepository.update(userId, { password: hashedPassword });
        await this.refreshTokenRepository.update({ userId, isRevoked: false }, { isRevoked: true, revokedAt: new Date() });
        return { message: 'Password changed successfully' };
    }
    async generateTokens(user) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m',
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d',
        });
        const refreshTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const savedRefreshToken = this.refreshTokenRepository.create({
            userId: user.id,
            token: refreshToken,
            expiresAt: refreshTokenExpiry,
        });
        await this.refreshTokenRepository.save(savedRefreshToken);
        return {
            accessToken,
            refreshToken,
            expiresIn: 900,
            user: {
                id: user.id,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.status,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(customer_profile_entity_1.CustomerProfile)),
    __param(2, (0, typeorm_1.InjectRepository)(refresh_token_entity_1.RefreshToken)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map