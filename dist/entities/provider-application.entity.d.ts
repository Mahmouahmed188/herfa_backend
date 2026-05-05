import { ProviderProfile } from './provider-profile.entity';
import { ProviderApplicationStatus } from '../common/constants/user.enums';
import { User } from './user.entity';
export declare class ProviderApplication {
    id: string;
    user: User;
    userId: string;
    providerProfileId: string;
    providerProfile: ProviderProfile;
    status: ProviderApplicationStatus;
    businessName: string;
    businessDescription: string;
    nationalId: string;
    nationalIdImage: string;
    licenseImage: string;
    portfolioImages: string;
    notes: string;
    reviewedBy: string;
    reviewedAt: Date;
    rejectionReason: string;
    createdAt: Date;
    updatedAt: Date;
}
