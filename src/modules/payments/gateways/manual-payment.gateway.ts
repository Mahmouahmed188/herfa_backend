import {
  PaymentGatewayProvider,
  PaymentData,
  AuthorizationResult,
  CaptureResult,
  RefundResult,
  CancelResult,
  GatewayTransactionStatus,
} from '../../../common/interfaces/payment-gateway.interface';

/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-unused-vars */

export class ManualPaymentGateway implements PaymentGatewayProvider {
  name = 'manual';

  async authorize(payment: PaymentData): Promise<AuthorizationResult> {
    const transactionReference = `MANUAL-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      transactionReference,
      gatewayResponse: {
        method: 'manual',
        paymentMethod: payment.paymentMethod,
      },
    };
  }

  async capture(authorizationId: string): Promise<CaptureResult> {
    return {
      success: true,
      transactionReference: authorizationId,
    };
  }

  async refund(transactionId: string, amount: number): Promise<RefundResult> {
    const refundReference = `REF-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    return {
      success: true,
      refundReference,
    };
  }

  async cancel(authorizationId: string): Promise<CancelResult> {
    return {
      success: true,
      transactionReference: authorizationId,
    };
  }

  async getStatus(transactionId: string): Promise<GatewayTransactionStatus> {
    return {
      status: 'completed',
      transactionReference: transactionId,
      amount: 0,
      currency: 'EGP',
      gatewayResponse: { method: 'manual' },
    };
  }
}
