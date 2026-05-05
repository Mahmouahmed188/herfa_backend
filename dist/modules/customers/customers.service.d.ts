import { Repository } from 'typeorm';
import { CustomerProfile } from '../../entities/customer-profile.entity';
export declare class CustomersService {
    private customerProfileRepository;
    constructor(customerProfileRepository: Repository<CustomerProfile>);
    getProfile(userId: string): Promise<CustomerProfile>;
    updateProfile(userId: string, data: Partial<CustomerProfile>): Promise<CustomerProfile>;
    setDefaultLocation(userId: string, latitude: number, longitude: number, address: string): Promise<CustomerProfile>;
}
