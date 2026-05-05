import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../../entities/service.entity';
import { ServiceCategory } from '../../entities/service-category.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/user.enums';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(
    @InjectRepository(ServiceCategory)
    private categoryRepository: Repository<ServiceCategory>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
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
  @ApiOperation({ summary: 'Get all services' })
  async getServices(@Query('categoryId') categoryId?: string) {
    const where: any = { isActive: true };
    if (categoryId) where.categoryId = categoryId;
    return this.serviceRepository.find({ where, order: { sortOrder: 'ASC' } });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get service by ID' })
  async getServiceById(@Param('id') id: string) {
    return this.serviceRepository.findOne({ where: { id }, relations: ['category'] });
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured services' })
  async getFeaturedServices() {
    return this.serviceRepository.find({ where: { isFeatured: true, isActive: true }, take: 10 });
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