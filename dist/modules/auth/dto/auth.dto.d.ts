import { UserRole } from '../../../common/constants/user.enums';
export declare class RegisterDto {
    email: string;
    phone: string;
    password: string;
    role?: UserRole;
    firstName?: string;
    lastName?: string;
}
export declare class LoginDto {
    identifier: string;
    password: string;
    fcmToken?: string;
}
export declare class RefreshTokenDto {
    refreshToken: string;
}
export declare class ForgotPasswordDto {
    email: string;
}
export declare class ResetPasswordDto {
    token: string;
    newPassword: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class AuthResponseDto {
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
}
