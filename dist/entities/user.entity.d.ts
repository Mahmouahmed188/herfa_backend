import { CustomerProfile } from './customer-profile.entity';
import { ProviderProfile } from './provider-profile.entity';
import { RefreshToken } from './refresh-token.entity';
export declare class User {
    id: string;
    email: string;
    phone: string;
    password: string;
    role: string;
    status: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    fcmToken: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    lastLoginAt: Date;
    resetToken: string;
    resetTokenExpiry: Date;
    customerProfile: CustomerProfile;
    providerProfile: ProviderProfile;
    refreshTokens: RefreshToken[];
    createdAt: Date;
    updatedAt: Date;
}
