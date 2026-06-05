# API Contract: Bookings

## Customer Endpoints

### `POST /bookings` — Create Booking

**Auth**: JWT (Customer role)

**Request Body**:
```json
{
  "serviceId": "uuid",
  "providerId": "uuid",
  "addressLine": "123 Main St",
  "city": "Cairo",
  "latitude": 30.0444,
  "longitude": 31.2357,
  "scheduledDate": "2026-06-15",
  "scheduledTime": "10:00",
  "notes": "Please bring equipment"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bookingNumber": "BKG-A1B2C3D4",
    "status": "pending",
    "scheduledDate": "2026-06-15",
    "scheduledTime": "10:00",
    "customer": { "id": "uuid", "name": "Ahmed" },
    "provider": { "id": "uuid", "name": "TechPro" },
    "service": { "id": "uuid", "title": "AC Repair" },
    "addressLine": "123 Main St",
    "city": "Cairo",
    "notes": "Please bring equipment",
    "createdAt": "2026-06-05T10:00:00Z"
  }
}
```

**Error Responses**:
- 400: Validation failed (invalid service, past date, etc.)
- 401: Unauthenticated
- 403: Forbidden (not a customer)
- 404: Service or provider not found

---

### `GET /bookings/my-bookings` — List My Bookings

**Auth**: JWT (Customer role)

**Query Parameters**:
- `status` — Filter by status
- `fromDate`, `toDate` — Date range filter
- `serviceId` — Filter by service
- `categoryId` — Filter by category
- `search` — Search by booking number
- `page` (default: 1)
- `limit` (default: 20)
- `sortBy` (default: createdAt)
- `sortOrder` (asc|desc, default: desc)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "items": [ /* BookingResponse[] */ ],
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

**Error Responses**:
- 401: Unauthenticated

---

### `GET /bookings/:id` — Get Booking Details

**Auth**: JWT (Customer role)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bookingNumber": "BKG-A1B2C3D4",
    "status": "accepted",
    "customer": { "id": "uuid", "name": "Ahmed" },
    "provider": { "id": "uuid", "name": "TechPro" },
    "service": { "id": "uuid", "title": "AC Repair" },
    "addressLine": "123 Main St",
    "city": "Cairo",
    "latitude": 30.0444,
    "longitude": 31.2357,
    "scheduledDate": "2026-06-15",
    "scheduledTime": "10:00",
    "notes": "Please bring equipment",
    "completedAt": null,
    "cancelledAt": null,
    "cancellationReason": null,
    "statusHistory": [
      { "oldStatus": null, "newStatus": "pending", "changedBy": "uuid", "createdAt": "..." }
    ],
    "createdAt": "2026-06-05T10:00:00Z",
    "updatedAt": "2026-06-05T10:05:00Z"
  }
}
```

**Error Responses**:
- 401: Unauthenticated
- 403: Forbidden (not the booking owner)
- 404: Booking not found

---

### `PATCH /bookings/:id/cancel` — Cancel Booking (Customer)

**Auth**: JWT (Customer role)

**Request Body**:
```json
{
  "reason": "Changed my mind"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "cancelledAt": "2026-06-05T11:00:00Z",
    "cancellationReason": "Changed my mind"
  }
}
```

**Error Responses**:
- 400: Cannot cancel booking in current status (only pending)
- 401: Unauthenticated
- 403: Forbidden (not the booking owner)
- 404: Booking not found

---

## Provider Endpoints

### `GET /provider/bookings` — List Assigned Bookings

**Auth**: JWT (Provider role)

**Query Parameters**: Same as customer listing (status, date range, search, pagination)

**Success Response** (200): Same paginated structure as customer listing, filtered to provider's assigned bookings only.

---

### `PATCH /bookings/:id/accept` — Accept Booking

**Auth**: JWT (Provider role)

**Success Response** (200):
```json
{
  "success": true,
  "data": { "id": "uuid", "status": "accepted" }
}
```

**Error Responses**:
- 400: Invalid transition from current status
- 403: Not assigned to this booking
- 404: Booking not found

---

### `PATCH /bookings/:id/reject` — Reject Booking

**Auth**: JWT (Provider role)

**Request Body**:
```json
{
  "reason": "Not available at this time"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": { "id": "uuid", "status": "rejected" }
}
```

---

### `PATCH /bookings/:id/on-the-way` — Mark On The Way

**Auth**: JWT (Provider role)

**Success Response** (200):
```json
{
  "success": true,
  "data": { "id": "uuid", "status": "on_the_way" }
}
```

---

### `PATCH /bookings/:id/start` — Mark In Progress

**Auth**: JWT (Provider role)

**Success Response** (200):
```json
{
  "success": true,
  "data": { "id": "uuid", "status": "in_progress" }
}
```

---

### `PATCH /bookings/:id/complete` — Mark Completed

**Auth**: JWT (Provider role)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "completed",
    "completedAt": "2026-06-15T14:30:00Z"
  }
}
```

---

## Admin Endpoints

### `GET /admin/bookings` — List All Bookings

**Auth**: JWT (Admin role)

**Query Parameters**: Same as customer listing, plus `customerId` and `providerId` filter options.

---

### `GET /admin/bookings/:id` — Get Booking Details (Admin)

**Auth**: JWT (Admin role)

Same response as customer detail endpoint, with no ownership restriction.

---

### `PATCH /admin/bookings/:id/cancel` — Cancel Any Booking (Admin)

**Auth**: JWT (Admin role)

**Request Body**:
```json
{
  "reason": "Provider reported no-show"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "cancelled",
    "cancelledAt": "2026-06-05T12:00:00Z",
    "cancellationReason": "Provider reported no-show"
  }
}
```

**Error Responses**:
- 400: Booking already in terminal state
- 401: Unauthenticated
- 403: Forbidden (not admin)
