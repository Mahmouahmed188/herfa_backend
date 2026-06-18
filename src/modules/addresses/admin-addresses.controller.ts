import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { AdminAddressFilterDto } from './dto/admin-address-filter.dto';

@ApiTags('Admin Addresses')
@Controller('admin/addresses')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class AdminAddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'List customer addresses (admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated list of addresses' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  async findAll(@Query() filter: AdminAddressFilterDto) {
    return this.addressesService.adminFindAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID (admin only)' })
  @ApiResponse({ status: 200, description: 'Address found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - admin only' })
  @ApiResponse({ status: 404, description: 'Address not found' })
  async findOne(@Param('id') id: string) {
    return this.addressesService.adminFindOne(id);
  }
}
