import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { ServiceCategory } from '../../entities/service-category.entity';
import { ServicesService } from './services.service';
import {
  CreateServiceDto,
  UpdateServiceDto,
  ServiceFilterDto,
  ToggleStatusDto,
  ServiceImageDto,
  SetPrimaryImageDto,
} from './dto/service.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(
    @InjectRepository(ServiceCategory)
    private categoryRepository: Repository<ServiceCategory>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    private readonly servicesService: ServicesService,
  ) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all service categories' })
  async getCategories() {
    return this.categoryRepository.find({ where: { isActive: true }, order: { sortOrder: 'ASC' } });
  }

  @Get('categories/:id')
  @ApiOperation({ summary: 'Get category by ID' })
  async getCategoryById(@Param('id') id: string) {
    return this.categoryRepository.findOne({ where: { id }, relations: ['services'] });
  }

  @Get()
  @ApiOperation({ summary: 'Browse active provider services with filtering, search, and pagination' })
  async browseServices(@Query() dto: ServiceFilterDto) {
    return this.servicesService.search(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service listing by ID' })
  async getServiceById(@Param('id') id: string) {
    return this.servicesService.findById(id);
  }
}

@ApiTags('Provider - Services')
@Controller('provider/services')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProviderServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new service listing' })
  async create(@CurrentUser() user: any, @Body() dto: CreateServiceDto) {
    return this.servicesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get my service listings' })
  async getMyServices(@CurrentUser() user: any) {
    return this.servicesService.findByProvider(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one of my service listings' })
  async getOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.servicesService.findById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update my service listing' })
  async update(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete my service listing' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.servicesService.remove(user.id, id);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Toggle service active/inactive status' })
  async toggleStatus(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ToggleStatusDto,
  ) {
    return this.servicesService.toggleStatus(user.id, id, dto.isActive);
  }

  @Post(':id/images')
  @ApiOperation({ summary: 'Add an image to a service' })
  async addImage(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: ServiceImageDto,
  ) {
    return this.servicesService.addImage(user.id, id, dto);
  }

  @Patch(':id/images/primary')
  @ApiOperation({ summary: 'Set primary image for a service' })
  async setPrimaryImage(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: SetPrimaryImageDto,
  ) {
    return this.servicesService.setPrimaryImage(user.id, id, dto.imageId);
  }

  @Delete(':id/images/:imageId')
  @ApiOperation({ summary: 'Remove an image from a service' })
  async removeImage(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('imageId') imageId: string,
  ) {
    return this.servicesService.removeImage(user.id, id, imageId);
  }
}

@ApiTags('Admin - Services')
@Controller('admin/services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminServicesController {
  constructor(
    @InjectRepository(ServiceCategory)
    private categoryRepository: Repository<ServiceCategory>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
  ) {}

  @Post('categories')
  @ApiOperation({ summary: 'Create service category' })
  async createCategory(@Body() body: any) {
    return this.categoryRepository.save(body);
  }

  @Patch('categories/:id')
  @ApiOperation({ summary: 'Update service category' })
  async updateCategory(@Param('id') id: string, @Body() body: any) {
    await this.categoryRepository.update(id, body);
    return this.categoryRepository.findOne({ where: { id } });
  }

  @Post()
  @ApiOperation({ summary: 'Create service' })
  async createService(@Body() body: any) {
    return this.serviceRepository.save(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update service' })
  async updateService(@Param('id') id: string, @Body() body: any) {
    await this.serviceRepository.update(id, body);
    return this.serviceRepository.findOne({ where: { id } });
  }
}

@ApiTags('Admin - Provider Services')
@Controller('admin/provider-services')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminProviderServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @ApiOperation({ summary: 'View all provider service listings' })
  async findAll() {
    return this.servicesService.findAllAdmin();
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate a provider service listing' })
  async deactivate(@Param('id') id: string) {
    return this.servicesService.deactivateAsAdmin(id);
  }
}
