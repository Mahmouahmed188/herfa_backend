# Events Contract: Booking Management

## Event-Driven Integration

Booking status changes emit events via `@nestjs/event-emitter` for loose coupling with future modules (Notifications, Reviews, Payments, Tracking).

## Event: `booking.created`

Emitted when a customer successfully creates a new booking.

**Payload**:
```json
{
  "event": "booking.created",
  "timestamp": "2026-06-05T10:00:00Z",
  "data": {
    "bookingId": "uuid",
    "bookingNumber": "BKG-A1B2C3D4",
    "customerId": "uuid",
    "providerId": "uuid",
    "serviceId": "uuid",
    "scheduledDate": "2026-06-15",
    "scheduledTime": "10:00"
  }
}
```

## Event: `booking.accepted`

Emitted when a provider accepts a pending booking.

**Payload**:
```json
{
  "event": "booking.accepted",
  "timestamp": "2026-06-05T10:05:00Z",
  "data": {
    "bookingId": "uuid",
    "bookingNumber": "BKG-A1B2C3D4",
    "providerId": "uuid",
    "customerId": "uuid"
  }
}
```

## Event: `booking.rejected`

Emitted when a provider rejects a pending booking.

**Payload**:
```json
{
  "event": "booking.rejected",
  "timestamp": "2026-06-05T10:05:00Z",
  "data": {
    "bookingId": "uuid",
    "bookingNumber": "BKG-A1B2C3D4",
    "providerId": "uuid",
    "customerId": "uuid",
    "reason": "Not available at this time"
  }
}
```

## Event: `booking.on_the_way`

Emitted when a provider marks the booking as on the way.

**Payload**:
```json
{
  "event": "booking.on_the_way",
  "timestamp": "2026-06-05T10:30:00Z",
  "data": {
    "bookingId": "uuid",
    "bookingNumber": "BKG-A1B2C3D4",
    "providerId": "uuid",
    "customerId": "uuid"
  }
}
```

## Event: `booking.in_progress`

Emitted when a provider marks the booking as work started.

**Payload**:
```json
{
  "event": "booking.in_progress",
  "timestamp": "2026-06-05T10:45:00Z",
  "data": {
    "bookingId": "uuid",
    "bookingNumber": "BKG-A1B2C3D4",
    "providerId": "uuid",
    "customerId": "uuid"
  }
}
```

## Event: `booking.completed`

Emitted when a provider marks the booking as completed.

**Payload**:
```json
{
  "event": "booking.completed",
  "timestamp": "2026-06-05T12:00:00Z",
  "data": {
    "bookingId": "uuid",
    "bookingNumber": "BKG-A1B2C3D4",
    "providerId": "uuid",
    "customerId": "uuid",
    "completedAt": "2026-06-05T12:00:00Z"
  }
}
```

## Event: `booking.cancelled`

Emitted when a booking is cancelled by customer or admin.

**Payload**:
```json
{
  "event": "booking.cancelled",
  "timestamp": "2026-06-05T11:00:00Z",
  "data": {
    "bookingId": "uuid",
    "bookingNumber": "BKG-A1B2C3D4",
    "cancelledBy": "uuid",
    "cancelledByRole": "customer|admin",
    "reason": "Changed my mind"
  }
}
```

## Integration Notes

- All events are emitted **after** the status change is persisted to ensure data consistency
- Event listeners should handle idempotency — the same event may be delivered more than once
- Events follow the naming convention `booking.<action>` for consistency
- The Notifications module should listen for these events to send push notifications, emails, or SMS
- Future modules (Reviews, Payments, Tracking) can listen for `booking.completed` to trigger their workflows
