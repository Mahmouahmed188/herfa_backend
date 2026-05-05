import { CustomersService } from './customers.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    getProfile(user: any): Promise<import("../../entities").CustomerProfile>;
    updateProfile(user: any, body: any): Promise<import("../../entities").CustomerProfile>;
    setLocation(user: any, body: {
        latitude: number;
        longitude: number;
        address: string;
    }): Promise<import("../../entities").CustomerProfile>;
}
