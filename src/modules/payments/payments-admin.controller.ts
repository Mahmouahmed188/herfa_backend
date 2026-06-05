import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { PaymentsAdminService } from './payments-admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/constants/user.enums';
import { PaymentFilterDto } from './dto/payment-filter.dto';
import { UpdatePaymentStatusDto } from './dto/update-payment-status.dto';
import { RefundRequestDto } from './dto/refund-request.dto';
import {
  PaymentResponseDto,
  PaginatedPaymentResponseDto,
} from './dto/payment-response.dto';
import { RefundResponseDto } from './dto/refund-response.dto';

@ApiTags('Payments - Admin')
@Controller('admin/payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
export class PaymentsAdminController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly paymentsAdminService: PaymentsAdminService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List all payments (admin)',
    description:
      'Get paginated list of all payments with filtering and sorting.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of payments',
    type: PaginatedPaymentResponseDto,
  })
  async getAllPayments(@Query() filters: PaymentFilterDto) {
    return this.paymentsService.getAllPayments(filters);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get payment details (admin)',
    description: 'Get detailed information about any payment.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment details',
    type: PaymentResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async getPaymentById(@Param('id') id: string) {
    return this.paymentsService.getPaymentById(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Update payment status (admin)',
    description:
      'Update payment status with transition validation. Valid transitions: pending→authorized, pending→failed, pending→cancelled, authorized→paid, authorized→failed, authorized→cancelled, paid→refunded, paid→partially_refunded, partially_refunded→refunded, partially_refunded→partially_refunded, failed→pending.',
  })
  @ApiResponse({
    status: 200,
    description: 'Payment status updated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid status transition' })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdatePaymentStatusDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsAdminService.updatePaymentStatus(id, dto, user);
  }

  @Post(':id/refund')
  @ApiOperation({
    summary: 'Process refund (admin)',
    description: 'Process full or partial refund against a paid payment.',
  })
  @ApiResponse({
    status: 201,
    description: 'Refund processed successfully',
    type: RefundResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid refund request' })
  async processRefund(
    @Param('id') id: string,
    @Body() dto: RefundRequestDto,
    @CurrentUser() user: any,
  ) {
    return this.paymentsAdminService.processRefund(id, dto, user);
  }
}
