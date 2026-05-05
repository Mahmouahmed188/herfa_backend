"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const dataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'herfa',
    entities: [__dirname + '/../entities/*{.ts,.js}'],
    synchronize: true,
});
async function seed() {
    await dataSource.initialize();
    console.log('Database connected...');
    const userRepo = dataSource.getRepository('users');
    const categoryRepo = dataSource.getRepository('service_categories');
    const serviceRepo = dataSource.getRepository('services');
    const hashedPassword = await bcrypt.hash('password123', 12);
    const admin = userRepo.create({
        email: 'admin@herfa.com',
        phone: '+1234567890',
        password: hashedPassword,
        role: 'super_admin',
        status: 'active',
        firstName: 'Admin',
        lastName: 'User',
        isEmailVerified: true,
    });
    await userRepo.save(admin);
    console.log('Admin user created');
    const customer = userRepo.create({
        email: 'customer@herfa.com',
        phone: '+1234567891',
        password: hashedPassword,
        role: 'customer',
        status: 'active',
        firstName: 'John',
        lastName: 'Doe',
        isEmailVerified: true,
    });
    await userRepo.save(customer);
    const customerProfile = dataSource.getRepository('customer_profiles').create({
        userId: customer.id,
        preferredLanguage: 'en',
    });
    await dataSource.getRepository('customer_profiles').save(customerProfile);
    console.log('Customer user created');
    const provider = userRepo.create({
        email: 'provider@herfa.com',
        phone: '+1234567892',
        password: hashedPassword,
        role: 'provider',
        status: 'active',
        firstName: 'Mike',
        lastName: 'Smith',
        isEmailVerified: true,
    });
    await userRepo.save(provider);
    const providerProfile = dataSource.getRepository('provider_profiles').create({
        userId: provider.id,
        businessName: 'Smith Services',
        businessDescription: 'Professional handyman services',
        address: '123 Main St, New York',
        latitude: 40.7128,
        longitude: -74.006,
        isAvailable: true,
        serviceRadiusKm: 25,
        verificationStatus: 'verified',
        rating: 4.5,
        totalJobsCompleted: 50,
    });
    await dataSource.getRepository('provider_profiles').save(providerProfile);
    console.log('Provider user created');
    const categories = [
        { name: 'Plumbing', description: 'Water and drainage services', icon: 'water', sortOrder: 1 },
        { name: 'Electrical', description: 'Electrical wiring and repairs', icon: 'flash', sortOrder: 2 },
        { name: 'Carpentry', description: 'Wood work and furniture', icon: 'hammer', sortOrder: 3 },
        { name: 'Cleaning', description: 'Home and office cleaning', icon: 'broom', sortOrder: 4 },
        { name: 'Painting', description: 'Interior and exterior painting', icon: 'paint', sortOrder: 5 },
        { name: 'AC Repair', description: 'Air conditioning services', icon: 'snowflake', sortOrder: 6 },
    ];
    for (const cat of categories) {
        const category = categoryRepo.create(cat);
        await categoryRepo.save(category);
        const services = [
            { name: `${cat.name} Installation`, description: `Professional ${cat.name.toLowerCase()} installation`, basePrice: 100, categoryId: category.id },
            { name: `${cat.name} Repair`, description: `${cat.name} repair services`, basePrice: 80, categoryId: category.id },
            { name: `${cat.name} Maintenance`, description: `Regular ${cat.name.toLowerCase()} maintenance`, basePrice: 60, categoryId: category.id },
        ];
        for (const svc of services) {
            const service = serviceRepo.create(svc);
            await serviceRepo.save(service);
        }
    }
    console.log('Categories and services created');
    await dataSource.destroy();
    console.log('Seed completed successfully!');
}
seed().catch(console.error);
//# sourceMappingURL=seed.js.map