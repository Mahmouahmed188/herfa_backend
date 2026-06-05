/**
 * Event contracts for notification generation.
 * Other modules emit these events; the Notifications module consumes them
 * via @OnEvent listeners. This decouples notification generation from
 * business logic.
 *
 * @contract NotificationEvents
 * @version 1.0.0
 */

// ─── Booking Events ───────────────────────────────────────────────────────

export interface BookingEventPayload {
  bookingId: string;
  customerId: string;
  providerId: string;
  serviceName?: string;
  timestamp: Date;
}

export type BookingEventName =
  | 'booking.created'
  | 'booking.accepted'
  | 'booking.rejected'
  | 'booking.on.the.way'
  | 'booking.in.progress'
  | 'booking.completed'
  | 'booking.cancelled';

// ─── Review Events ────────────────────────────────────────────────────────

export interface ReviewEventPayload {
  reviewId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  timestamp: Date;
}

export type ReviewEventName = 'review.submitted';

// ─── Payment Events ────────────────────────────────────────────────────────

export interface PaymentEventPayload {
  paymentId: string;
  customerId: string;
  providerId?: string;
  amount: number;
  timestamp: Date;
}

export type PaymentEventName =
  | 'payment.received'
  | 'payment.failed'
  | 'payment.refunded';

// ─── Account Events ────────────────────────────────────────────────────────

export interface AccountEventPayload {
  userId: string;
  action: 'verified' | 'suspended';
  performedBy?: string;
  reason?: string;
  timestamp: Date;
}

export type AccountEventName =
  | 'account.verified'
  | 'account.suspended';
