import { User } from './user.entity';
export declare class RefreshToken {
    id: string;
    user: User;
    userId: string;
    token: string;
    expiresAt: Date;
    isRevoked: boolean;
    revokedAt: Date;
    deviceInfo: string;
    ipAddress: string;
    createdAt: Date;
}
