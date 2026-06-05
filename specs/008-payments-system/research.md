# Research: Payments System

## 1. Payment Status Transition Matrix

### Existing Status Constants

Current `PaymentStatus` enum in `src/common/constants/user.enums.ts`:
- PENDING = 'pending'
- PROCESSING = 'processing'
- COMPLETED = 'completed'
- FAILED = 'failed'
- REFUNDED = 'refunded'

### Required Statuses (from spec)

- pending, authorized, paid, failed, refunded, partially_refunded, cancelled

### Transition Rules

| From | To | Valid |
|------|-----|-------|
| pending | authorized | ✅ |
| pending | failed | ✅ |
| pending | cancelled | ✅ |
| authorized | paid | ✅ |
| authorized | failed | ✅ |
| authorized | cancelled | ✅ |
| paid | refunded | ✅ |
| paid | partially_refunded | ✅ |
| partially_refunded | refunded | ✅ (full refund after partial) |
| partially_refunded | partially_refunded | ✅ (additional partial) |
| failed | pending | ✅ (retry) |
| cancelled | - | ❌ (terminal) |
| refunded | - | ❌ (terminal) |

### Decision

Create a new `PaymentStatus` enum with values: `PENDING`, `AUTHORIZED`, `PAID`, `FAILED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `CANCELLED`. Implement a transition validation map as a constant that defines valid next statuses for each current status.

### Notification Events Mapping

| Transition | Notification Event |
|------------|-------------------|
| → paid | payment_completed |
| → failed | payment_failed |
| → refunded / partially_refunded | refund_issued |
| → cancelled | payment_cancelled |

---

## 2. Payment Number Generation Strategy

### Options Considered
1. **UUID**: Not user-friendly, hard to read/communicate
2. **Timestamp-based**: `PAY-YYYYMMDD-HHMMSS-XXX` — collision possible with high concurrency
3. **Auto-increment sequence**: Simple but sequential numbers reveal business volume
4. **ULID**: Sortable, unique, URL-friendly

### Decision

Use a combination of prefix + timestamp + random suffix: `PAY-` + `YYYYMMDD` + `-` + 6-char alphanumeric random string. Example: `PAY-20260605-A3F9K2`.

**Rationale**: Unique without centralized sequence, human-readable, no sequential leak, sufficient for platform scale.

**Alternatives considered**: UUID (not user-friendly), pure auto-increment (leaks volume).

---

## 3. Audit Logging Approach

### Options Considered
1. **NestJS Logger only**: In-memory, not persistent
2. **Database audit table**: Persistent but adds query overhead
3. **External audit service**: Heavy for current scale
4. **Dedicated `audit_logs` table**: Simple, queryable, persistent

### Decision

Create a dedicated `audit_logs` database table (TypeORM entity + Prisma model) with fields: `id` (UUID), `action` (string — e.g., 'PAYMENT_CREATED', 'STATUS_UPDATED', 'REFUND_PROCESSED', 'PAYMENT_FAILED'), `entityType` (e.g., 'payment', 'refund'), `entityId` (UUID), `actorId` (UUID — who performed the action), `actorRole` (string — customer/provider/admin), `metadata` (JSON — previous state, new state, reason), `createdAt`. No update/delete allowed (immutable).

**Rationale**: Database-level audit provides immutability (no update/delete operations), queryability for investigation, and integration with existing TypeORM patterns.

---

## 4. Event-Driven Notification Integration Pattern

### Existing Notification Infrastructure
- `notifications` table with `type` enum including: `PAYMENT_RECEIVED`, `PAYMENT_FAILED`, `REFUND_PROCESSED`
- `NotificationsService` in `src/modules/notifications/notifications.service.ts`
- `EventEmitterModule` available in NestJS ecosystem

### Decision

Use `@nestjs/event-emitter` for decoupled event-driven integration. The payments service emits events like `payment.completed`, `payment.failed`, `refund.issued`, `payment.cancelled`. A dedicated `PaymentNotificationHandler` in the notifications module listens for these events and creates notifications.

Events payload:
```typescript
{
  paymentId: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  amount: number;
  currency: string;
  timestamp: Date;
}
```

**Rationale**: Event-emitter keeps payments module decoupled from notifications module, follows existing NestJS patterns, and supports future event bus migration if needed.

---

## 5. Payment Gateway Abstraction Layer Design

### Decision

Define a `PaymentGatewayProvider` interface in `src/common/interfaces/payment-gateway.interface.ts`:

```typescript
interface PaymentGatewayProvider {
  name: string;
  authorize(payment: PaymentData): Promise<AuthorizationResult>;
  capture(authorizationId: string): Promise<CaptureResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
  cancel(authorizationId: string): Promise<CancelResult>;
  getStatus(transactionId: string): Promise<GatewayTransactionStatus>;
}
```

Supporting types:
```typescript
interface PaymentData {
  amount: number;
  currency: string;
  paymentMethod: string;
  metadata?: Record<string, any>;
}

interface AuthorizationResult {
  success: boolean;
  transactionReference: string;
  gatewayResponse?: Record<string, any>;
}

interface CaptureResult {
  success: boolean;
  transactionReference: string;
}

interface RefundResult {
  success: boolean;
  refundReference: string;
}
```

A `PaymentGatewayService` will manage registered providers and route payments to the appropriate gateway based on payment method. For current methods (Cash, Wallet), a `ManualPaymentGateway` implementation handles offline tracking.

**Rationale**: The interface pattern allows adding new gateways (Stripe, Paymob, Fawry, Vodafone Cash, Apple Pay, Google Pay) by implementing the interface without modifying core payment logic.
