import { ProvidersService } from './providers.service';
import { CreateProviderApplicationDto, UpdateProviderProfileDto, SetAvailabilityDto, UpdateLocationDto, ProviderServiceDto, SearchProvidersDto } from './dto/providers.dto';
export declare class ProvidersController {
    private readonly providersService;
    constructor(providersService: ProvidersService);
    apply(user: any, dto: CreateProviderApplicationDto): Promise<import("../../entities").ProviderApplication>;
    getProfile(user: any): Promise<import("../../entities").ProviderProfile>;
    updateProfile(user: any, dto: UpdateProviderProfileDto): Promise<import("../../entities").ProviderProfile>;
    setAvailability(user: any, dto: SetAvailabilityDto): Promise<import("../../entities").ProviderProfile>;
    updateLocation(user: any, dto: UpdateLocationDto): Promise<import("../../entities").ProviderProfile>;
    addService(user: any, dto: ProviderServiceDto): Promise<import("../../entities").ProviderService>;
    removeService(user: any, serviceId: string): Promise<{
        message: string;
    }>;
    listProviders(dto: SearchProvidersDto): Promise<{
        data: import("../../entities").ProviderProfile[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    searchProviders(dto: SearchProvidersDto): Promise<{
        data: import("../../entities").ProviderProfile[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getProviderJobs(user: any, status?: string): Promise<import("typeorm").ObjectLiteral[]>;
    getProviderStats(user: any): Promise<{
        totalJobsCompleted: number;
        totalEarnings: number;
        rating: number;
        responseTimeMinutes: number;
        isAvailable: boolean;
    }>;
    getProviderById(id: string): Promise<import("../../entities").ProviderProfile>;
}
