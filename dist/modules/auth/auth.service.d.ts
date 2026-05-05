import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { CustomerProfile } from '../../entities/customer-profile.entity';
import { RefreshToken } from '../../entities/refresh-token.entity';
import { RegisterDto, LoginDto, RefreshTokenDto } from './dto/auth.dto';
export declare class AuthService {
    private userRepository;
    private customerProfileRepository;
    private refreshTokenRepository;
    private jwtService;
    private configService;
    constructor(userRepository: Repository<User>, customerProfileRepository: Repository<CustomerProfile>, refreshTokenRepository: Repository<RefreshToken>, jwtService: JwtService, configService: ConfigService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            phone: string;
            role: string;
            status: string;
        };
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            phone: string;
            role: string;
            status: string;
        };
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            phone: string;
            role: string;
            status: string;
        };
    }>;
    logout(userId: string, refreshToken?: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        message: string;
        resetToken?: undefined;
    } | {
        message: string;
        resetToken: string;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        message: string;
    }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
    private generateTokens;
}
