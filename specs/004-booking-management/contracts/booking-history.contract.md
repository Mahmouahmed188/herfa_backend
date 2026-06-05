# API Contract: Booking Status History

Status history is returned as part of the booking detail response (`GET /bookings/:id`). There is no standalone history endpoint — history is always accessed in the context of a specific booking.

## History Record Structure

Each history entry is immutable and contains:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique record identifier |
| oldStatus | string \| null | Previous status (null for creation) |
| newStatus | string | New status after transition |
| changedBy | UUID | ID of the user who performed the change |
| createdAt | TIMESTAMP | When the change occurred |

## Example History for a Completed Booking

```json
{
  "statusHistory": [
    { "oldStatus": null, "newStatus": "pending", "changedBy": "cust-uuid", "createdAt": "2026-06-05T10:00:00Z" },
    { "oldStatus": "pending", "newStatus": "accepted", "changedBy": "prov-uuid", "createdAt": "2026-06-05T10:05:00Z" },
    { "oldStatus": "accepted", "newStatus": "on_the_way", "changedBy": "prov-uuid", "createdAt": "2026-06-05T10:30:00Z" },
    { "oldStatus": "on_the_way", "newStatus": "in_progress", "changedBy": "prov-uuid", "createdAt": "2026-06-05T10:45:00Z" },
    { "oldStatus": "in_progress", "newStatus": "completed", "changedBy": "prov-uuid", "createdAt": "2026-06-05T12:00:00Z" }
  ]
}
```

## Example History for a Cancelled Booking

```json
{
  "statusHistory": [
    { "oldStatus": null, "newStatus": "pending", "changedBy": "cust-uuid", "createdAt": "2026-06-05T10:00:00Z" },
    { "oldStatus": "pending", "newStatus": "cancelled", "changedBy": "cust-uuid", "createdAt": "2026-06-05T10:10:00Z" }
  ]
}
```

## Audit Requirements

- History records are append-only (no updates or deletes permitted)
- Each status transition creates exactly one history record
- The `oldStatus` for the first record (creation) is always `null`
- The `changedBy` field must reference a valid user ID
- History is ordered by `createdAt` ascending
