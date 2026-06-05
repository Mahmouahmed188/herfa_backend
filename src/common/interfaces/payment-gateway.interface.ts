export interface PaymentData {
  amount: number;
  currency: string;
  paymentMethod: string;
  metadata?: Record<string, any>;
}

export interface AuthorizationResult {
  success: boolean;
  transactionReference: string;
  gatewayResponse?: Record<string, any>;
}

export interface CaptureResult {
  success: boolean;
  transactionReference: string;
}

export interface RefundResult {
  success: boolean;
  refundReference: string;
}

export interface CancelResult {
  success: boolean;
  transactionReference: string;
}

export interface GatewayTransactionStatus {
  status: string;
  transactionReference: string;
  amount: number;
  currency: string;
  gatewayResponse?: Record<string, any>;
}

export interface PaymentGatewayProvider {
  name: string;
  authorize(payment: PaymentData): Promise<AuthorizationResult>;
  capture(authorizationId: string): Promise<CaptureResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
  cancel(authorizationId: string): Promise<CancelResult>;
  getStatus(transactionId: string): Promise<GatewayTransactionStatus>;
}
