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
import { ProvidersService } from './providers.service';
import {
  CreateProviderApplicationDto,
  UpdateProviderProfileDto,
  SetAvailabilityDto,
  UpdateLocationDto,
  ProviderServiceDto,
} from './dto/providers.dto';
import { ProviderCategoryDto } from './dto/provider-category.dto';
import { ProviderSearchDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';

@ApiTags('Providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to become a provider' })
  async apply(
    @CurrentUser() user: any,
    @Body() dto: CreateProviderApplicationDto,
  ) {
    return this.providersService.apply(user.id, dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get own provider profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.providersService.getProfile(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update provider profile' })
  async updateProfile(
    @CurrentUser() user: any,
    @Body() dto: UpdateProviderProfileDto,
  ) {
    return this.providersService.updateProfile(user.id, dto);
  }

  @Post('availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set provider availability' })
  async setAvailability(
    @CurrentUser() user: any,
    @Body() dto: SetAvailabilityDto,
  ) {
    return this.providersService.setAvailability(user.id, dto);
  }

  @Post('location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update provider location' })
  async updateLocation(
    @CurrentUser() user: any,
    @Body() dto: UpdateLocationDto,
  ) {
    return this.providersService.updateLocation(user.id, dto);
  }

  @Post('services')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add service to provider' })
  async addService(@CurrentUser() user: any, @Body() dto: ProviderServiceDto) {
    return this.providersService.addService(user.id, dto);
  }

  @Delete('services/:serviceId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove service from provider' })
  async removeService(
    @CurrentUser() user: any,
    @Param('serviceId') serviceId: string,
  ) {
    return this.providersService.removeService(user.id, serviceId);
  }

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get categories assigned to my profile' })
  async getMyCategories(@CurrentUser() user: any) {
    return this.providersService.getCategories(user.id);
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set categories for my profile' })
  async setCategories(
    @CurrentUser() user: any,
    @Body() dto: ProviderCategoryDto,
  ) {
    return this.providersService.setCategories(user.id, dto);
  }

  @Delete('categories/:categoryId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Remove a category from my profile' })
  async removeCategory(
    @CurrentUser() user: any,
    @Param('categoryId') categoryId: string,
  ) {
    return this.providersService.removeCategory(user.id, categoryId);
  }

  @Get()
  @ApiOperation({
    summary:
      'List and search providers with filtering, sorting, and pagination',
  })
  async listProviders(@Query() dto: ProviderSearchDto) {
    return this.providersService.searchProviders(dto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search providers (alias for GET /providers)' })
  async searchProviders(@Query() dto: ProviderSearchDto) {
    return this.providersService.searchProviders(dto);
  }

  @Get('jobs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my jobs' })
  async getProviderJobs(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.providersService.getProviderJobs(user.id, status);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get provider statistics' })
  async getProviderStats(@CurrentUser() user: any) {
    return this.providersService.getProviderStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider by ID (userId or profileId)' })
  async getProviderById(@Param('id') id: string) {
    return this.providersService.getProfileByIdOrUserId(id);
  }
}

@ApiTags('Admin - Providers')
@Controller('admin/providers')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Patch(':profileId/verify')
  @ApiOperation({ summary: 'Verify or reject a provider profile' })
  async verifyProvider(
    @Param('profileId') profileId: string,
    @Body('status') status: string,
  ) {
    return this.providersService.verifyProvider(profileId, status);
  }

  @Patch(':profileId/suspend')
  @ApiOperation({ summary: 'Suspend or reactivate a provider' })
  async suspendProvider(
    @Param('profileId') profileId: string,
    @Body('isSuspended') isSuspended: boolean,
  ) {
    return this.providersService.suspendProvider(profileId, isSuspended);
  }
}
