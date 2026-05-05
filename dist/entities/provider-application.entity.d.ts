import { ProviderProfile } from './provider-profile.entity';
import { User } from './user.entity';
export declare class ProviderApplication {
    id: string;
    user: User;
    userId: string;
    providerProfileId: string;
    providerProfile: ProviderProfile;
    status: string;
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
