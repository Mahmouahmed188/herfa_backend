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
  SearchProvidersDto,
} from './dto/providers.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Providers')
@Controller('providers')
export class ProvidersController {
  constructor(private readonly providersService: ProvidersService) {}

  @Post('apply')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Apply to become a provider' })
  async apply(@CurrentUser() user: any, @Body() dto: CreateProviderApplicationDto) {
    return this.providersService.apply(user.id, dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get provider profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.providersService.getProfile(user.id);
  }

  @Patch('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update provider profile' })
  async updateProfile(@CurrentUser() user: any, @Body() dto: UpdateProviderProfileDto) {
    return this.providersService.updateProfile(user.id, dto);
  }

  @Post('availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set provider availability' })
  async setAvailability(@CurrentUser() user: any, @Body() dto: SetAvailabilityDto) {
    return this.providersService.setAvailability(user.id, dto);
  }

  @Post('location')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update provider location' })
  async updateLocation(@CurrentUser() user: any, @Body() dto: UpdateLocationDto) {
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
  async removeService(@CurrentUser() user: any, @Param('serviceId') serviceId: string) {
    return this.providersService.removeService(user.id, serviceId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search providers' })
  async searchProviders(@Query() dto: SearchProvidersDto) {
    return this.providersService.searchProviders(dto);
  }

  @Get('jobs')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get provider jobs' })
  async getProviderJobs(@CurrentUser() user: any, @Query('status') status?: string) {
    return this.providersService.getProviderJobs(user.id, status);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get provider stats' })
  async getProviderStats(@CurrentUser() user: any) {
    return this.providersService.getProviderStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get provider by ID' })
  async getProviderById(@Param('id') id: string) {
    const profile = await this.providersService.getProfile(id);
    return profile;
  }
}