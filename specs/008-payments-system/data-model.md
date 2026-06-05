# Data Model: Payments & Refunds

## Entity: Payment

**Table**: `payments`

**Description**: Represents a financial transaction associated with a booking.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| paymentNumber | VARCHAR(30) | UNIQUE, NOT NULL | Format: PAY-YYYYMMDD-XXXXXX |
| bookingId | UUID | NOT NULL, FK → bookings(id) | |
| customerId | UUID | NOT NULL, FK → users(id) | |
| providerId | UUID | NOT NULL, FK → users(id) | |
| amount | DECIMAL(10,2) | NOT NULL, > 0 | |
| currency | VARCHAR(3) | NOT NULL | Default: EGP |
| paymentMethod | VARCHAR(30) | NOT NULL | Enum: cash, credit_card, debit_card, wallet |
| paymentStatus | VARCHAR(20) | NOT NULL, default: 'pending' | Enum: pending, authorized, paid, failed, refunded, partially_refunded, cancelled |
| transactionReference | VARCHAR(255) | NULL | External gateway transaction ID |
| notes | TEXT | NULL | Free-text notes |
| paidAt | TIMESTAMP | NULL | Set when status → paid |
| createdAt | TIMESTAMP | NOT NULL, default: now() | |
| updatedAt | TIMESTAMP | NOT NULL, default: now() | |

### Indexes

| Name | Columns | Type |
|------|---------|------|
| idx_payment_booking | bookingId | B-tree |
| idx_payment_customer | customerId | B-tree |
| idx_payment_provider | providerId | B-tree |
| idx_payment_status | paymentStatus | B-tree |
| idx_payment_payment_number | paymentNumber | UNIQUE |
| idx_payment_created_at | createdAt | B-tree |
| idx_payment_status_created | paymentStatus, createdAt | Composite |

### Relationships

- **Booking**: Many-to-One → `bookings` (a payment belongs to one booking)
- **Customer**: Many-to-One → `users` (a payment belongs to one customer)
- **Provider**: Many-to-One → `users` (a payment belongs to one provider)
- **Refunds**: One-to-Many → `refunds` (a payment can have many refunds)

### Status Transition Map

```typescript
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['authorized', 'failed', 'cancelled'],
  authorized: ['paid', 'failed', 'cancelled'],
  paid: ['refunded', 'partially_refunded'],
  partially_refunded: ['refunded', 'partially_refunded'],
  failed: ['pending'],
  refunded: [],
  cancelled: [],
};
```

---

## Entity: Refund

**Table**: `refunds`

**Description**: Represents a full or partial refund issued against a payment.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| paymentId | UUID | NOT NULL, FK → payments(id) | |
| refundAmount | DECIMAL(10,2) | NOT NULL, > 0 | Cannot exceed remaining refundable amount |
| refundReason | VARCHAR(255) | NOT NULL | |
| refundedBy | UUID | NOT NULL, FK → users(id) | Admin who processed the refund |
| refundedAt | TIMESTAMP | NOT NULL, default: now() | |
| createdAt | TIMESTAMP | NOT NULL, default: now() | |

### Indexes

| Name | Columns | Type |
|------|---------|------|
| idx_refund_payment | paymentId | B-tree |
| idx_refund_refunded_by | refundedBy | B-tree |
| idx_refund_created_at | createdAt | B-tree |

### Relationships

- **Payment**: Many-to-One → `payments` (a refund belongs to one payment)

### Validation Rules

- `refundAmount` must be greater than 0
- The sum of all refunds for a payment must not exceed the original payment amount
- Refunds can only be created against payments with status `paid` or `partially_refunded`

---

## Entity: AuditLog

**Table**: `audit_logs`

**Description**: Immutable log of all critical payment actions.

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID | PK, auto-generated | |
| action | VARCHAR(50) | NOT NULL | Enum: PAYMENT_CREATED, STATUS_UPDATED, REFUND_PROCESSED, PAYMENT_FAILED |
| entityType | VARCHAR(30) | NOT NULL | 'payment' or 'refund' |
| entityId | UUID | NOT NULL | |
| actorId | UUID | NOT NULL | User who performed the action |
| actorRole | VARCHAR(20) | NOT NULL | customer, provider, admin |
| metadata | JSONB | NULL | Previous state, new state, reason, etc. |
| createdAt | TIMESTAMP | NOT NULL, default: now() | |

### Indexes

| Name | Columns | Type |
|------|---------|------|
| idx_audit_entity | entityType, entityId | B-tree |
| idx_audit_actor | actorId | B-tree |
| idx_audit_action | action | B-tree |
| idx_audit_created | createdAt | B-tree |

---

## Prisma Schema Updates

### payments model (UPDATE existing)

```prisma
model payments {
  id                  String    @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  paymentNumber       String    @unique @db.VarChar(30)
  bookingId           String    @db.Uuid
  customerId          String    @db.Uuid
  providerId          String    @db.Uuid
  amount              Decimal   @db.Decimal(10, 2)
  currency            String    @default("EGP") @db.VarChar(3)
  paymentMethod       String    @db.VarChar(30)
  paymentStatus       String    @default("pending") @db.VarChar(20)
  transactionReference String?  @db.VarChar(255)
  notes               String?   @db.Text
  paidAt              DateTime? @db.Timestamp(6)
  createdAt           DateTime  @default(now()) @db.Timestamp(6)
  updatedAt           DateTime  @default(now()) @db.Timestamp(6)

  booking  Booking @relation(fields: [bookingId], references: [id])
  customer User    @relation("payments_customer_idTousers", fields: [customerId], references: [id])
  provider User    @relation("payments_provider_idTousers", fields: [providerId], references: [id])
  refunds  refunds[]

  @@index([bookingId])
  @@index([customerId])
  @@index([providerId])
  @@index([paymentStatus])
  @@index([paymentStatus, createdAt])
  @@map("payments")
}
```

### refunds model (CREATE new)

```prisma
model refunds {
  id           String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  paymentId    String   @db.Uuid
  refundAmount Decimal  @db.Decimal(10, 2)
  refundReason String   @db.VarChar(255)
  refundedBy   String   @db.Uuid
  refundedAt   DateTime @default(now()) @db.Timestamp(6)
  createdAt    DateTime @default(now()) @db.Timestamp(6)

  payment payments @relation(fields: [paymentId], references: [id])

  @@index([paymentId])
  @@index([refundedBy])
  @@map("refunds")
}
```

### audit_logs model (CREATE new)

```prisma
model audit_logs {
  id         String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  action     String   @db.VarChar(50)
  entityType String   @db.VarChar(30)
  entityId   String   @db.Uuid
  actorId    String   @db.Uuid
  actorRole  String   @db.VarChar(20)
  metadata   Json?    @db.Json
  createdAt  DateTime @default(now()) @db.Timestamp(6)

  @@index([entityType, entityId])
  @@index([actorId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```
