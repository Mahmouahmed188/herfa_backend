import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { PaymentOwnerGuard } from './guards/payment-owner.guard';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import {
  PaymentResponseDto,
  PaginatedPaymentResponseDto,
} from './dto/payment-response.dto';

@ApiTags('Payments - Provider')
@Controller('provider/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROVIDER)
@ApiBearerAuth()
export class ProviderPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({
    summary: 'List provider payments',
    description:
      'Get paginated list of payments related to the authenticated provider bookings with filtering and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of payments',
    type: PaginatedPaymentResponseDto,
  })
  async getProviderPayments(
    @CurrentUser() user: any,
    @Query() filters: PaymentFilterDto,
  ) {
    return this.paymentsService.getProviderPayments(user.id, filters);
  }

  @Get(':id')
  @UseGuards(PaymentOwnerGuard)
  @ApiOperation({
    summary: 'Get payment details (provider)',
    description:
      'Get detailed information about a payment related to one of your bookings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment details',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getPaymentById(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }
}
