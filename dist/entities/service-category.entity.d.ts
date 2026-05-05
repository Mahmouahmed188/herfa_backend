import { Service } from './service.entity';
export declare class ServiceCategory {
    id: string;
    name: string;
    description: string;
    icon: string;
    image: string;
    isActive: boolean;
    sortOrder: number;
    services: Service[];
    createdAt: Date;
    updatedAt: Date;
}
