import { ProviderProfile } from './provider-profile.entity';
import { Service } from './service.entity';
export declare class ProviderService {
    id: string;
    provider: ProviderProfile;
    providerId: string;
    service: Service;
    serviceId: string;
    price: number;
    priceUnit: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
