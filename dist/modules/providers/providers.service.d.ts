import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { ProviderProfile } from '../../entities/provider-profile.entity';
import { ProviderApplication } from '../../entities/provider-application.entity';
import { ProviderService } from '../../entities/provider-service.entity';
import { Service } from '../../entities/service.entity';
import { CreateProviderApplicationDto, UpdateProviderProfileDto, SetAvailabilityDto, UpdateLocationDto, ProviderServiceDto, SearchProvidersDto } from './dto/providers.dto';
export declare class ProvidersService {
    private userRepository;
    private providerProfileRepository;
    private applicationRepository;
    private providerServiceRepository;
    private serviceRepository;
    constructor(userRepository: Repository<User>, providerProfileRepository: Repository<ProviderProfile>, applicationRepository: Repository<ProviderApplication>, providerServiceRepository: Repository<ProviderService>, serviceRepository: Repository<Service>);
    apply(userId: string, dto: CreateProviderApplicationDto): Promise<ProviderApplication>;
    getProfile(userId: string): Promise<ProviderProfile>;
    updateProfile(userId: string, dto: UpdateProviderProfileDto): Promise<ProviderProfile>;
    setAvailability(userId: string, dto: SetAvailabilityDto): Promise<ProviderProfile>;
    updateLocation(userId: string, dto: UpdateLocationDto): Promise<ProviderProfile>;
    addService(userId: string, dto: ProviderServiceDto): Promise<ProviderService>;
    removeService(userId: string, serviceId: string): Promise<{
        message: string;
    }>;
    searchProviders(dto: SearchProvidersDto): Promise<{
        data: ProviderProfile[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getProviderJobs(userId: string, status?: string): Promise<import("typeorm").ObjectLiteral[]>;
    getProviderStats(userId: string): Promise<{
        totalJobsCompleted: number;
        totalEarnings: number;
        rating: number;
        responseTimeMinutes: number;
        isAvailable: boolean;
    }>;
}
