export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  WALLET = 'wallet',
}

export const VALID_PAYMENT_TRANSITIONS: Record<string, string[]> = {
  pending: ['authorized', 'failed', 'cancelled'],
  authorized: ['paid', 'failed', 'cancelled'],
  paid: ['refunded', 'partially_refunded'],
  partially_refunded: ['refunded', 'partially_refunded'],
  failed: ['pending'],
  refunded: [],
  cancelled: [],
};

export function isValidPaymentTransition(
  currentStatus: string,
  nextStatus: string,
): boolean {
  const allowed = VALID_PAYMENT_TRANSITIONS[currentStatus];
  if (!allowed) return false;
  return allowed.includes(nextStatus);
}
