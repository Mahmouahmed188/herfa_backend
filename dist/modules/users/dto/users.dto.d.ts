import { UserRole, UserStatus } from '../../../common/constants/user.enums';
export declare class UpdateUserDto {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    profileImage?: string;
    status?: UserStatus;
}
export declare class UserQueryDto {
    page?: number;
    limit?: number;
    role?: UserRole;
    status?: UserStatus;
}
