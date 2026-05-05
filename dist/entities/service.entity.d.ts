import { ServiceCategory } from './service-category.entity';
import { ProviderService } from './provider-service.entity';
export declare class Service {
    id: string;
    name: string;
    description: string;
    image: string;
    icon: string;
    category: ServiceCategory;
    categoryId: string;
    isActive: boolean;
    sortOrder: number;
    basePrice: number;
    priceUnit: string;
    isFeatured: boolean;
    providerServices: ProviderService[];
    createdAt: Date;
    updatedAt: Date;
}
