import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { ServiceCategory } from '../../entities/service-category.entity';
export declare class ServicesController {
    private categoryRepository;
    private serviceRepository;
    constructor(categoryRepository: Repository<ServiceCategory>, serviceRepository: Repository<Service>);
    getCategories(): Promise<ServiceCategory[]>;
    getCategoryById(id: string): Promise<ServiceCategory | null>;
    getServices(categoryId?: string): Promise<Service[]>;
    getServiceById(id: string): Promise<Service | null>;
    getFeaturedServices(): Promise<Service[]>;
}
export declare class AdminServicesController {
    private categoryRepository;
    private serviceRepository;
    constructor(categoryRepository: Repository<ServiceCategory>, serviceRepository: Repository<Service>);
    createCategory(body: any): Promise<any>;
    updateCategory(id: string, body: any): Promise<ServiceCategory | null>;
    createService(body: any): Promise<any>;
    updateService(id: string, body: any): Promise<Service | null>;
}
