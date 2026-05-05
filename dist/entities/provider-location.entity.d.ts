import { ProviderProfile } from './provider-profile.entity';
export declare class ProviderLocation {
    id: string;
    provider: ProviderProfile;
    providerId: string;
    location: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number;
    heading: number;
    altitude: number;
    batteryLevel: number;
    isOnline: boolean;
    isOnJob: boolean;
    currentJobId: string;
    createdAt: Date;
    updatedAt: Date;
}
