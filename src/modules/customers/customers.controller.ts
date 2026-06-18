import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Customers')
@Controller('customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get customer profile' })
  async getProfile(@CurrentUser() user: any) {
    return this.customersService.getProfile(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update customer profile' })
  async updateProfile(@CurrentUser() user: any, @Body() body: any) {
    return this.customersService.updateProfile(user.id, body);
  }

  @Patch('location')
  @ApiOperation({ summary: 'Set default location' })
  async setLocation(
    @CurrentUser() user: any,
    @Body() body: { latitude: number; longitude: number; address: string },
  ) {
    return this.customersService.setDefaultLocation(
      user.id,
      body.latitude,
      body.longitude,
      body.address,
    );
  }
}
