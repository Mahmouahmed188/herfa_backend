import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment' })
  async createPayment(@CurrentUser() user: any, @Body() body: { jobId: string; amount: number }) {
    return this.paymentsService.createPayment(body.jobId, user.id, body.amount);
  }

  @Post(':id/process')
  @ApiOperation({ summary: 'Process payment' })
  async processPayment(@Param('id') id: string, @Body('transactionId') transactionId: string) {
    return this.paymentsService.processPayment(id, transactionId);
  }

  @Get('my-payments')
  @ApiOperation({ summary: 'Get customer payments' })
  async getCustomerPayments(@CurrentUser() user: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.paymentsService.getPaymentsByCustomer(user.id, page, limit);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund payment (Admin)' })
  async refundPayment(@Param('id') id: string) {
    return this.paymentsService.refundPayment(id);
  }
}

@ApiTags('Provider - Payments')
@Controller('provider/payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProviderPaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get provider payments' })
  async getProviderPayments(@CurrentUser() user: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.paymentsService.getPaymentsByProvider(user.id, page, limit);
  }
}