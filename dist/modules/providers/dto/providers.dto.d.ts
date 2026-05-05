export declare class CreateProviderApplicationDto {
    businessName: string;
    businessDescription?: string;
    nationalId?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    serviceRadiusKm?: number;
    bio?: string;
}
export declare class UpdateProviderProfileDto {
    businessName?: string;
    businessDescription?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    serviceRadiusKm?: number;
    bio?: string;
    workingHours?: string;
}
export declare class SetAvailabilityDto {
    isAvailable: boolean;
}
export declare class UpdateLocationDto {
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    altitude?: number;
}
export declare class ProviderServiceDto {
    serviceId: string;
    price: number;
    priceUnit?: string;
}
export declare class SearchProvidersDto {
    latitude?: number;
    longitude?: number;
    radiusKm?: number;
    serviceId?: string;
    isAvailable?: boolean;
    page?: number;
    limit?: number;
}
