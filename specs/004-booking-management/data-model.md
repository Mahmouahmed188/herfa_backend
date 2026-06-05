# Data Model: Booking Management System

## Entity: Booking

Represents a service request from a customer to a provider.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary identifier |
| bookingNumber | VARCHAR(20) | UNIQUE, NOT NULL | Human-readable unique booking reference (e.g., BKG-XXXXXXXX) |
| customerId | UUID | FK → users.id, NOT NULL, INDEX | Customer who created the booking |
| providerId | UUID | FK → provider_profiles.id, NOT NULL, INDEX | Provider assigned to fulfill the booking |
| serviceId | UUID | FK → services.id, NOT NULL | Service being requested |
| addressLine | VARCHAR(255) | NOT NULL | Customer's address line |
| city | VARCHAR(100) | NOT NULL | Customer's city |
| latitude | DECIMAL(10,7) | NULLABLE | Latitude for future tracking |
| longitude | DECIMAL(10,7) | NULLABLE | Longitude for future tracking |
| scheduledDate | DATE | NOT NULL, INDEX | Preferred service date |
| scheduledTime | TIME | NOT NULL | Preferred service time (HH:MM 24h) |
| notes | TEXT | NULLABLE | Optional customer notes |
| status | ENUM | NOT NULL, INDEX, DEFAULT 'pending' | Current booking status |
| completedAt | TIMESTAMP | NULLABLE | When service was completed |
| cancelledAt | TIMESTAMP | NULLABLE | When booking was cancelled |
| cancellationReason | TEXT | NULLABLE | Reason for cancellation |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL, ON UPDATE NOW() | Last update timestamp |

### Indexes

- `idx_booking_number` UNIQUE on `bookingNumber`
- `idx_booking_customer` on `customerId`
- `idx_booking_provider` on `providerId`
- `idx_booking_status` on `status`
- `idx_booking_scheduled_date` on `scheduledDate`
- `idx_booking_customer_status` composite on `(customerId, status)`
- `idx_booking_provider_status` composite on `(providerId, status)`

### Status Values

```
pending → accepted → on_the_way → in_progress → completed
pending → rejected
pending → cancelled
accepted → cancelled
on_the_way → cancelled
in_progress → cancelled
```

Terminal states: `completed`, `rejected`, `cancelled`

### Relationships

- **Customer** (User): A customer can have many bookings. `Booking.customerId` → `User.id`
- **Provider** (ProviderProfile): A provider can have many bookings. `Booking.providerId` → `ProviderProfile.id`
- **Service**: A service can have many bookings. `Booking.serviceId` → `Service.id`
- **BookingStatusHistory**: A booking has many status history records. `Booking.id` → `BookingStatusHistory.bookingId`

---

## Entity: BookingStatusHistory

Immutable audit log for every booking status change.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Primary identifier |
| bookingId | UUID | FK → bookings.id, NOT NULL, INDEX | Reference to the booking |
| oldStatus | ENUM | NOT NULL | Previous status value |
| newStatus | ENUM | NOT NULL | New status value |
| changedBy | UUID | FK → users.id, NOT NULL | Who performed the status change |
| createdAt | TIMESTAMP | NOT NULL, DEFAULT NOW() | When the change occurred (immutable) |

### Indexes

- `idx_history_booking` on `bookingId` (for efficient history lookups)
- `idx_history_created` on `createdAt` (for chronological queries)

### Constraints

- Records are INSERT-only — no updates or deletes allowed (immutability enforced at application layer)

### Relationships

- **Booking**: A history record belongs to exactly one booking. `BookingStatusHistory.bookingId` → `Booking.id`
- **User** (changedBy): The user who performed the status change. `BookingStatusHistory.changedBy` → `User.id`

---

## Validation Rules

### Booking Creation

- `serviceId` must reference an existing service
- `providerId` must reference an existing provider
- The provider must own the selected service (via `ProviderService` join table)
- `scheduledDate` must be today or in the future
- `scheduledTime` must be a valid 24-hour time (HH:MM)
- `addressLine` and `city` are required
- `latitude` and `longitude` are optional (tracking future use)

### Status Transitions

- Only transitions defined in the state machine above are permitted
- Transitions to the current status (duplicate) are rejected
- Transitions on terminal states (completed, rejected, cancelled) are rejected
- Status is case-sensitive, stored as lowercase

### Access Control

- Customers can only access bookings where `customerId` matches their user ID
- Providers can only access bookings where `providerId` matches their provider profile ID
- Admins can access all bookings
- Customers can only cancel bookings in `pending` status
- Admins can cancel bookings from any non-terminal state
