import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { config } from 'dotenv';
import * as path from 'path';

config();

const useSqlite = process.env.USE_SQLITE === 'true';

const dataSource = new DataSource(
  useSqlite
    ? {
        type: 'better-sqlite3',
        database: process.env.SQLITE_PATH || 'herfa.db',
        entities: [path.join(__dirname, '../entities/*.entity{.ts,.js}')],
        synchronize: true,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_DATABASE || 'herfa',
        entities: [path.join(__dirname, '../entities/*.entity{.ts,.js}')],
        synchronize: true,
      },
);

async function seed() {
  await dataSource.initialize();
  console.log('Database connected...');

  const userRepo = dataSource.getRepository('users');
  const categoryRepo = dataSource.getRepository('service_categories');
  const serviceRepo = dataSource.getRepository('services');
  const listingRepo = dataSource.getRepository('service_listings');
  const imageRepo = dataSource.getRepository('service_images');

  // ── Clear existing seed data (idempotent) ──
  await dataSource.query(`DELETE FROM service_images`);
  await dataSource.query(`DELETE FROM service_listings`);
  await dataSource.query(`DELETE FROM provider_services`);
  await dataSource.query(`DELETE FROM provider_categories`);
  await dataSource.query(`DELETE FROM services`);
  await dataSource.query(`DELETE FROM service_categories`);
  await dataSource.query(`DELETE FROM customer_profiles`);
  await dataSource.query(`DELETE FROM provider_profiles`);
  await dataSource.query(`DELETE FROM provider_applications`);
  await dataSource.query(`DELETE FROM users`);

  const hashedPassword = await bcrypt.hash('password123', 12);

  // ── Admin user ──
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

  // ── Customer user ──
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

  // ── Provider user ──
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

  // ── Service Categories ──
  const categoriesData = [
    { name: 'Plumbing', description: 'Water supply, drainage, and pipe repair services', icon: 'water', sortOrder: 1 },
    { name: 'Electrical', description: 'Electrical wiring, fixtures, and appliance installation', icon: 'flash', sortOrder: 2 },
    { name: 'Carpentry', description: 'Woodwork, furniture assembly, and custom builds', icon: 'hammer', sortOrder: 3 },
    { name: 'Cleaning', description: 'Residential and commercial deep cleaning', icon: 'broom', sortOrder: 4 },
    { name: 'Painting', description: 'Interior and exterior painting and finishing', icon: 'paint', sortOrder: 5 },
    { name: 'AC Repair', description: 'Air conditioning installation, repair, and maintenance', icon: 'snowflake', sortOrder: 6 },
    { name: 'Home Maintenance', description: 'General home upkeep and repair services', icon: 'home', sortOrder: 7 },
    { name: 'Moving Services', description: 'Packing, loading, transport, and unpacking', icon: 'truck', sortOrder: 8 },
    { name: 'Appliance Repair', description: 'Fix and service household appliances', icon: 'tool', sortOrder: 9 },
    { name: 'Gardening', description: 'Lawn care, landscaping, and garden maintenance', icon: 'leaf', sortOrder: 10 },
  ];

  const categories: any[] = [];
  for (const cat of categoriesData) {
    const category = categoryRepo.create(cat);
    const saved = await categoryRepo.save(category);
    categories.push(saved);
  }
  console.log(`${categories.length} categories created`);

  // ── Master Services (in the `services` table) ──
  const allServices: any[] = [];

  const servicesByCategory = {
    Plumbing: [
      { name: 'Pipe Repair', description: 'Fix leaking or burst pipes', basePrice: 120, priceUnit: 'per hour' },
      { name: 'Drain Cleaning', description: 'Unclog and clean blocked drains', basePrice: 90, priceUnit: 'per hour' },
      { name: 'Water Heater Installation', description: 'Install new water heating systems', basePrice: 250, priceUnit: 'fixed' },
      { name: 'Faucet Repair', description: 'Fix dripping or faulty faucets', basePrice: 70, priceUnit: 'per hour' },
      { name: 'Toilet Installation', description: 'Install new toilets and fixtures', basePrice: 150, priceUnit: 'fixed' },
    ],
    Electrical: [
      { name: 'Lighting Installation', description: 'Install indoor and outdoor lighting', basePrice: 100, priceUnit: 'per hour' },
      { name: 'Outlet Repair', description: 'Fix or replace electrical outlets', basePrice: 80, priceUnit: 'per hour' },
      { name: 'Circuit Breaker Replacement', description: 'Replace faulty breakers', basePrice: 180, priceUnit: 'fixed' },
      { name: 'Ceiling Fan Installation', description: 'Mount and wire ceiling fans', basePrice: 120, priceUnit: 'fixed' },
      { name: 'Wiring Inspection', description: 'Full electrical safety inspection', basePrice: 150, priceUnit: 'per hour' },
    ],
    Carpentry: [
      { name: 'Custom Shelving', description: 'Build and install custom shelves', basePrice: 130, priceUnit: 'per hour' },
      { name: 'Door Repair', description: 'Fix sticking or broken doors', basePrice: 90, priceUnit: 'per hour' },
      { name: 'Furniture Assembly', description: 'Assemble flat-pack furniture', basePrice: 60, priceUnit: 'per hour' },
      { name: 'Cabinet Installation', description: 'Install kitchen or bathroom cabinets', basePrice: 200, priceUnit: 'fixed' },
      { name: 'Deck Building', description: 'Build wooden decks and patios', basePrice: 350, priceUnit: 'fixed' },
    ],
    Cleaning: [
      { name: 'Deep Cleaning', description: 'Full home deep cleaning service', basePrice: 150, priceUnit: 'fixed' },
      { name: 'Office Cleaning', description: 'Commercial office cleaning', basePrice: 200, priceUnit: 'fixed' },
      { name: 'Carpet Cleaning', description: 'Professional carpet shampooing', basePrice: 80, priceUnit: 'per room' },
      { name: 'Window Cleaning', description: 'Interior and exterior window wash', basePrice: 100, priceUnit: 'fixed' },
      { name: 'Move-Out Cleaning', description: 'End-of-tenancy deep clean', basePrice: 180, priceUnit: 'fixed' },
    ],
    Painting: [
      { name: 'Interior Painting', description: 'Paint rooms and hallways', basePrice: 200, priceUnit: 'per room' },
      { name: 'Exterior Painting', description: 'Paint building exteriors', basePrice: 400, priceUnit: 'fixed' },
      { name: 'Wallpaper Removal', description: 'Strip old wallpaper and prep walls', basePrice: 120, priceUnit: 'per room' },
      { name: 'Fence Painting', description: 'Paint wooden or metal fences', basePrice: 150, priceUnit: 'fixed' },
      { name: 'Texture Finishing', description: 'Apply textured wall finishes', basePrice: 180, priceUnit: 'per room' },
    ],
    'AC Repair': [
      { name: 'AC Installation', description: 'Install split or central AC units', basePrice: 300, priceUnit: 'fixed' },
      { name: 'AC Repair', description: 'Diagnose and fix AC issues', basePrice: 120, priceUnit: 'per hour' },
      { name: 'AC Maintenance', description: 'Annual tune-up and cleaning', basePrice: 100, priceUnit: 'fixed' },
      { name: 'Duct Cleaning', description: 'Clean air ducts and vents', basePrice: 250, priceUnit: 'fixed' },
      { name: 'Thermostat Replacement', description: 'Install smart or digital thermostats', basePrice: 80, priceUnit: 'fixed' },
    ],
    'Home Maintenance': [
      { name: 'General Handyman', description: 'Odd jobs and minor home repairs', basePrice: 60, priceUnit: 'per hour' },
      { name: 'Gutter Cleaning', description: 'Clean and unclog rain gutters', basePrice: 80, priceUnit: 'fixed' },
      { name: 'Caulking & Sealing', description: 'Seal gaps around windows and doors', basePrice: 70, priceUnit: 'per hour' },
      { name: 'Drywall Repair', description: 'Patch holes and fix drywall', basePrice: 90, priceUnit: 'per hour' },
      { name: 'Tile Grouting', description: 'Replace or repair tile grout', basePrice: 100, priceUnit: 'per hour' },
    ],
    'Moving Services': [
      { name: 'Local Moving', description: 'Within-city moving service', basePrice: 250, priceUnit: 'fixed' },
      { name: 'Long Distance Moving', description: 'Inter-city moving service', basePrice: 800, priceUnit: 'fixed' },
      { name: 'Packing Service', description: 'Professional packing of belongings', basePrice: 150, priceUnit: 'fixed' },
      { name: 'Furniture Disassembly', description: 'Take apart and reassemble furniture', basePrice: 80, priceUnit: 'per hour' },
      { name: 'Loading & Unloading', description: 'Labor-only loading and unloading', basePrice: 100, priceUnit: 'per hour' },
    ],
    'Appliance Repair': [
      { name: 'Refrigerator Repair', description: 'Fix cooling and electrical issues', basePrice: 130, priceUnit: 'per hour' },
      { name: 'Washing Machine Repair', description: 'Repair drum, pump, or electrical faults', basePrice: 120, priceUnit: 'per hour' },
      { name: 'Oven & Stove Repair', description: 'Fix heating and gas issues', basePrice: 110, priceUnit: 'per hour' },
      { name: 'Dishwasher Repair', description: 'Fix drainage and cleaning issues', basePrice: 100, priceUnit: 'per hour' },
      { name: 'Microwave Repair', description: 'Fix microwave not heating or turning on', basePrice: 80, priceUnit: 'per hour' },
    ],
    Gardening: [
      { name: 'Lawn Mowing', description: 'Grass cutting and lawn edging', basePrice: 50, priceUnit: 'per hour' },
      { name: 'Tree Trimming', description: 'Prune and trim trees and bushes', basePrice: 100, priceUnit: 'per hour' },
      { name: 'Landscaping Design', description: 'Full garden design and planting', basePrice: 300, priceUnit: 'fixed' },
      { name: 'Irrigation Setup', description: 'Install sprinkler or drip systems', basePrice: 200, priceUnit: 'fixed' },
      { name: 'Weed Control', description: 'Remove weeds and apply treatment', basePrice: 70, priceUnit: 'per hour' },
    ],
  };

  const servicesByCatMap: Record<string, any[]> = servicesByCategory;
  for (const cat of categories) {
    const svcList = servicesByCatMap[cat.name];
    if (!svcList) continue;

    for (const svcData of svcList) {
      const service = serviceRepo.create({
        ...svcData,
        categoryId: cat.id,
        isActive: true,
        sortOrder: 0,
        isFeatured: false,
      });
      const saved = await serviceRepo.save(service);
      allServices.push(saved);
    }
  }
  console.log(`${allServices.length} master services created`);

  // ── Service Listings (the table queried by GET /api/v1/services) ──
  const listingTemplates = [
    { title: 'Emergency Pipe Repair', description: '24/7 emergency pipe burst repair service. Fast response within 30 minutes. Fully licensed and insured plumbers.', basePrice: 150, estimatedDurationMinutes: 90, categoryName: 'Plumbing' },
    { title: 'Drain Cleaning & Unclogging', description: 'Professional drain cleaning using advanced hydro-jetting technology. Clears even the toughest blockages.', basePrice: 90, estimatedDurationMinutes: 60, categoryName: 'Plumbing' },
    { title: 'Water Heater Installation', description: 'Expert installation of tank and tankless water heaters. All major brands supported with warranty.', basePrice: 250, estimatedDurationMinutes: 180, categoryName: 'Plumbing' },
    { title: 'Faucet & Tap Repair', description: 'Fix dripping, leaking, or stuck faucets. Quick and reliable service with quality replacement parts.', basePrice: 70, estimatedDurationMinutes: 45, categoryName: 'Plumbing' },
    { title: 'Full Bathroom Plumbing', description: 'Complete bathroom plumbing including toilet, sink, shower, and pipe installation.', basePrice: 400, estimatedDurationMinutes: 360, categoryName: 'Plumbing' },
    { title: 'Electrical Wiring & Rewiring', description: 'Safe and code-compliant electrical wiring for new builds and renovations.', basePrice: 180, estimatedDurationMinutes: 120, categoryName: 'Electrical' },
    { title: 'Lighting Installation', description: 'Install chandeliers, recessed lighting, pendant lights, and outdoor fixtures.', basePrice: 100, estimatedDurationMinutes: 60, categoryName: 'Electrical' },
    { title: 'Circuit Breaker Repair', description: 'Diagnose and replace faulty circuit breakers. Ensure your electrical panel is safe.', basePrice: 180, estimatedDurationMinutes: 90, categoryName: 'Electrical' },
    { title: 'Ceiling Fan Installation', description: 'Mount and wire ceiling fans with remote control integration.', basePrice: 120, estimatedDurationMinutes: 75, categoryName: 'Electrical' },
    { title: 'Smart Home Installation', description: 'Install smart switches, thermostats, and home automation systems.', basePrice: 150, estimatedDurationMinutes: 120, categoryName: 'Electrical' },
    { title: 'Custom Shelving & Storage', description: 'Design and build custom shelving units, bookcases, and storage solutions.', basePrice: 130, estimatedDurationMinutes: 180, categoryName: 'Carpentry' },
    { title: 'Door Repair & Installation', description: 'Fix sticking doors, replace hinges, or install new interior/exterior doors.', basePrice: 90, estimatedDurationMinutes: 90, categoryName: 'Carpentry' },
    { title: 'Furniture Assembly', description: 'Professional assembly of IKEA and other flat-pack furniture.', basePrice: 60, estimatedDurationMinutes: 60, categoryName: 'Carpentry' },
    { title: 'Kitchen Cabinet Installation', description: 'Install new kitchen cabinets with precise alignment and finishing.', basePrice: 200, estimatedDurationMinutes: 240, categoryName: 'Carpentry' },
    { title: 'Deck & Patio Construction', description: 'Build custom wooden decks, patios, and outdoor structures.', basePrice: 350, estimatedDurationMinutes: 480, categoryName: 'Carpentry' },
    { title: 'Full Home Deep Cleaning', description: 'Comprehensive deep cleaning of entire home including hard-to-reach areas.', basePrice: 150, estimatedDurationMinutes: 240, categoryName: 'Cleaning' },
    { title: 'Office & Commercial Cleaning', description: 'Professional cleaning for office spaces, retail stores, and commercial properties.', basePrice: 200, estimatedDurationMinutes: 180, categoryName: 'Cleaning' },
    { title: 'Carpet & Upholstery Cleaning', description: 'Steam cleaning for carpets, sofas, and upholstery using eco-friendly products.', basePrice: 80, estimatedDurationMinutes: 60, categoryName: 'Cleaning' },
    { title: 'Window & Glass Cleaning', description: 'Streak-free window cleaning for residential and commercial properties.', basePrice: 100, estimatedDurationMinutes: 90, categoryName: 'Cleaning' },
    { title: 'Move-In/Move-Out Cleaning', description: 'Deep cleaning service tailored for tenants moving in or out of properties.', basePrice: 180, estimatedDurationMinutes: 240, categoryName: 'Cleaning' },
    { title: 'Interior Wall Painting', description: 'Professional interior painting with premium paints and clean finish.', basePrice: 200, estimatedDurationMinutes: 240, categoryName: 'Painting' },
    { title: 'Exterior House Painting', description: 'Weather-resistant exterior painting with surface preparation included.', basePrice: 400, estimatedDurationMinutes: 480, categoryName: 'Painting' },
    { title: 'Wallpaper Removal & Installation', description: 'Remove old wallpaper and install new wallpaper or paint.', basePrice: 120, estimatedDurationMinutes: 180, categoryName: 'Painting' },
    { title: 'Fence & Gate Painting', description: 'Paint and seal wooden or metal fences and gates.', basePrice: 150, estimatedDurationMinutes: 180, categoryName: 'Painting' },
    { title: 'Decorative Texture Finishing', description: 'Apply Venetian plaster, textured walls, and decorative paint finishes.', basePrice: 180, estimatedDurationMinutes: 240, categoryName: 'Painting' },
    { title: 'AC Installation & Setup', description: 'Professional installation of split, window, and central AC units.', basePrice: 300, estimatedDurationMinutes: 240, categoryName: 'AC Repair' },
    { title: 'AC Diagnostic & Repair', description: 'Complete AC diagnostic and repair service. All major brands serviced.', basePrice: 120, estimatedDurationMinutes: 90, categoryName: 'AC Repair' },
    { title: 'AC Maintenance & Tune-Up', description: 'Annual AC maintenance including coil cleaning, gas check, and filter replacement.', basePrice: 100, estimatedDurationMinutes: 60, categoryName: 'AC Repair' },
    { title: 'Duct Cleaning & Sanitization', description: 'Clean and sanitize air ducts for improved air quality and efficiency.', basePrice: 250, estimatedDurationMinutes: 180, categoryName: 'AC Repair' },
    { title: 'Thermostat Installation', description: 'Install programmable and smart thermostats with full setup.', basePrice: 80, estimatedDurationMinutes: 45, categoryName: 'AC Repair' },
    { title: 'General Handyman Services', description: 'Fix squeaky doors, loose handles, broken tiles, and other home odd jobs.', basePrice: 60, estimatedDurationMinutes: 60, categoryName: 'Home Maintenance' },
    { title: 'Gutter Cleaning & Repair', description: 'Clean and repair rain gutters and downspouts.', basePrice: 80, estimatedDurationMinutes: 90, categoryName: 'Home Maintenance' },
    { title: 'Drywall Repair & Patching', description: 'Patch holes, repair cracks, and finish drywall for painting.', basePrice: 90, estimatedDurationMinutes: 90, categoryName: 'Home Maintenance' },
    { title: 'Caulking & Weatherproofing', description: 'Seal windows, doors, and gaps to improve energy efficiency.', basePrice: 70, estimatedDurationMinutes: 60, categoryName: 'Home Maintenance' },
    { title: 'Tile & Grout Repair', description: 'Replace broken tiles and regrout bathroom and kitchen surfaces.', basePrice: 100, estimatedDurationMinutes: 120, categoryName: 'Home Maintenance' },
    { title: 'Local Moving (Within City)', description: 'Full-service local moving including packing, loading, transport, and unloading.', basePrice: 250, estimatedDurationMinutes: 300, categoryName: 'Moving Services' },
    { title: 'Long Distance Moving', description: 'Reliable long-distance moving service with secure transport and insurance.', basePrice: 800, estimatedDurationMinutes: 600, categoryName: 'Moving Services' },
    { title: 'Professional Packing Service', description: 'Careful packing of all belongings using quality materials.', basePrice: 150, estimatedDurationMinutes: 180, categoryName: 'Moving Services' },
    { title: 'Furniture Disassembly & Assembly', description: 'Take apart furniture for moving and reassemble at the new location.', basePrice: 80, estimatedDurationMinutes: 90, categoryName: 'Moving Services' },
    { title: 'Loading & Unloading Labor', description: 'Heavy lifting labor for loading and unloading trucks and containers.', basePrice: 100, estimatedDurationMinutes: 120, categoryName: 'Moving Services' },
    { title: 'Refrigerator Repair Service', description: 'Diagnose and fix refrigerator cooling, thermostat, and compressor issues.', basePrice: 130, estimatedDurationMinutes: 90, categoryName: 'Appliance Repair' },
    { title: 'Washing Machine Repair', description: 'Fix washing machine drum, pump, drainage, and electrical problems.', basePrice: 120, estimatedDurationMinutes: 90, categoryName: 'Appliance Repair' },
    { title: 'Oven & Stove Repair', description: 'Repair electric and gas ovens, cooktops, and ranges.', basePrice: 110, estimatedDurationMinutes: 90, categoryName: 'Appliance Repair' },
    { title: 'Dishwasher Repair', description: 'Fix dishwasher drainage, cleaning, and electronic control issues.', basePrice: 100, estimatedDurationMinutes: 75, categoryName: 'Appliance Repair' },
    { title: 'Microwave & Small Appliance Repair', description: 'Fix microwaves, toasters, blenders, and other small kitchen appliances.', basePrice: 80, estimatedDurationMinutes: 60, categoryName: 'Appliance Repair' },
    { title: 'Lawn Mowing & Edging', description: 'Professional lawn mowing, edging, and grass trimming service.', basePrice: 50, estimatedDurationMinutes: 60, categoryName: 'Gardening' },
    { title: 'Tree & Bush Trimming', description: 'Prune and shape trees, hedges, and bushes for healthy growth.', basePrice: 100, estimatedDurationMinutes: 120, categoryName: 'Gardening' },
    { title: 'Garden Landscaping Design', description: 'Full garden design, planting, and hardscaping services.', basePrice: 300, estimatedDurationMinutes: 480, categoryName: 'Gardening' },
    { title: 'Irrigation System Installation', description: 'Install sprinkler systems and drip irrigation for efficient watering.', basePrice: 200, estimatedDurationMinutes: 240, categoryName: 'Gardening' },
    { title: 'Weed Control & Lawn Treatment', description: 'Apply weed control treatments and fertilizers for a healthy lawn.', basePrice: 70, estimatedDurationMinutes: 60, categoryName: 'Gardening' },
  ];

  const inactiveListings = new Set([
    'Faucet & Tap Repair',
    'Smart Home Installation',
    'Deck & Patio Construction',
    'Move-In/Move-Out Cleaning',
    'Wallpaper Removal & Installation',
    'Duct Cleaning & Sanitization',
    'Drywall Repair & Patching',
    'Loading & Unloading Labor',
    'Dishwasher Repair',
    'Tree & Bush Trimming',
    'Fence & Gate Painting',
    'Gutter Cleaning & Repair',
    'Office & Commercial Cleaning',
    'Caulking & Weatherproofing',
  ]);

  const categoryMap: Record<string, any> = {};
  for (const cat of categories) {
    categoryMap[cat.name] = cat;
  }

  for (const tmpl of listingTemplates) {
    const cat = categoryMap[tmpl.categoryName];
    if (!cat) {
      console.warn(`Category "${tmpl.categoryName}" not found, skipping listing "${tmpl.title}"`);
      continue;
    }

    const listing = listingRepo.create({
      providerId: provider.id,
      categoryId: cat.id,
      title: tmpl.title,
      description: tmpl.description,
      basePrice: tmpl.basePrice,
      currency: 'EGP',
      estimatedDurationMinutes: tmpl.estimatedDurationMinutes,
      isActive: !inactiveListings.has(tmpl.title),
    });
    const savedListing = await listingRepo.save(listing);

    const imageUrl = `https://picsum.photos/seed/${encodeURIComponent(tmpl.title.replace(/\s+/g, '-').toLowerCase())}/600/400`;
    await imageRepo.save(
      imageRepo.create({
        serviceId: savedListing.id,
        imageUrl,
        isPrimary: true,
      }),
    );
  }
  console.log(`${listingTemplates.length} service listings created`);

  await dataSource.destroy();
  console.log('Seed completed successfully!');
}

seed().catch(console.error);
