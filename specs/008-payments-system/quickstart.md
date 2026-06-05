# Quickstart: Payments System

## Prerequisites

- Node.js >= 20
- PostgreSQL with `uuid-ossp` extension enabled
- Existing Herfa Backend running with Auth, Users, Booking, and Notifications modules

## Setup Steps

### 1. Database Migration

```bash
# Update Prisma schema
npx prisma generate
npx prisma db push
# OR create a migration
npx prisma migrate dev --name add-payments-system
```

### 2. TypeORM Entity Sync

Ensure TypeORM entities in `src/entities/` match the Prisma schema:
- Update `src/entities/payment.entity.ts`
- Create `src/entities/refund.entity.ts`
- Optionally create `src/entities/audit-log.entity.ts`
- Update `src/entities/index.ts` to export new entities

### 3. Enums Setup

Update `src/common/constants/user.enums.ts` — replace `PaymentStatus` with:
```typescript
export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
}
```

Create `src/common/constants/payment.enums.ts` for `PaymentMethod`:
```typescript
export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  WALLET = 'wallet',
}
```

### 4. Register Modules

In `src/app.module.ts`, ensure `PaymentsModule` is imported and add `RefundsModule` if it is a separate module.

### 5. Verify Endpoints

```bash
# Customer endpoints
GET  /api/payments
GET  /api/payments/:id

# Provider endpoints
GET  /api/provider/payments
GET  /api/provider/payments/:id

# Admin endpoints
GET     /api/admin/payments
GET     /api/admin/payments/:id
PATCH   /api/admin/payments/:id/status
POST    /api/admin/payments/:id/refund
```

### 6. Run Tests

```bash
# Unit tests
npm run test -- --testPathPattern=payments
npm run test -- --testPathPattern=refunds

# All tests
npm run test
```

## Key Architecture Decisions

- **Dual ORM**: TypeORM entities for runtime, Prisma for schema management and migrations
- **Status Transition Validation**: Inline map constant in service layer
- **Audit Logging**: Database-backed `audit_logs` table (immutable — no update/delete)
- **Notifications**: `@nestjs/event-emitter` for decoupled event-driven integration
- **Payment Gateway Abstraction**: Interface-based provider pattern in `src/common/interfaces/`
- **Payment Number**: Auto-generated as `PAY-YYYYMMDD-XXXXXX`

## Dependencies

| Module | Purpose |
|--------|---------|
| Auth | JWT authentication guard |
| Users | User roles (customer, provider, admin) |
| Booking | Booking entity for payment linkage |
| Notifications | Event handlers for payment notifications |

## Integration Points

- **Booking Module**: After booking creation → trigger payment creation
- **Notifications Module**: Listen for `payment.completed`, `payment.failed`, `refund.issued`, `payment.cancelled` events
- **Admin Module**: Admin role guard shared from existing infrastructure
