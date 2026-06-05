# API Contracts: Support Tickets & Disputes System

**Phase**: 1 | **Date**: 2026-06-05

## Customer / Provider Endpoints

### POST /support/tickets
Create a new support ticket.

**Auth**: Customer, Provider (JWT required)
**Request Body**:
```json
{
  "subject": "Payment not processed",
  "description": "I paid via card but the booking still shows unpaid.",
  "category": "payment",
  "bookingId": "uuid-optional"
}
```
**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ticketNumber": "TKT-A3F8K2M1",
    "userId": "uuid",
    "category": "payment",
    "priority": "medium",
    "status": "open",
    "subject": "Payment not processed",
    "description": "I paid via card but the booking still shows unpaid.",
    "assignedAdminId": null,
    "createdAt": "2026-06-05T10:00:00Z",
    "updatedAt": "2026-06-05T10:00:00Z"
  }
}
```

### GET /support/tickets
List user's support tickets with filtering, pagination, sorting.

**Auth**: Customer, Provider (JWT required)
**Query Params**: status, category, priority, dateFrom, dateTo, page, limit, sortBy, sortOrder, search
**Response** (200):
```json
{
  "success": true,
  "data": [...],
  "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
}
```

### GET /support/tickets/:id
Get a single ticket with message history.

**Auth**: Customer, Provider, Admin (JWT required)
**Response** (200): Single ticket object with nested `messages[]` array.

### POST /support/tickets/:id/messages
Add a message to a ticket.

**Auth**: Customer, Provider, Admin (JWT required)
**Request Body**:
```json
{
  "message": "I have attached the receipt screenshot."
}
```
**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "ticketId": "uuid",
    "senderId": "uuid",
    "message": "I have attached the receipt screenshot.",
    "createdAt": "2026-06-05T10:05:00Z"
  }
}
```

### POST /support/disputes
Create a new dispute linked to a booking.

**Auth**: Customer, Provider (JWT required)
**Request Body**:
```json
{
  "bookingId": "uuid",
  "title": "Service not completed",
  "description": "The provider left before finishing the job."
}
```
**Response** (201): Dispute object.

### GET /support/disputes
List user's disputes with filtering, pagination.

**Auth**: Customer, Provider (JWT required)
**Query Params**: status, bookingId, dateFrom, dateTo, page, limit, sortBy, sortOrder
**Response** (200): Paginated dispute list.

### GET /support/disputes/:id
Get a single dispute with evidence attachments.

**Auth**: Customer, Provider, Admin (JWT required)
**Response** (200): Single dispute object with nested `evidence[]` array.

### POST /support/disputes/:id/evidence
Upload evidence file for a dispute.

**Auth**: Customer, Provider, Admin (JWT required)
**Request Body**: multipart/form-data with `file` field.
**Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "disputeId": "uuid",
    "uploadedBy": "uuid",
    "fileUrl": "/uploads/evidence/uuid-filename.pdf",
    "fileType": "application/pdf",
    "uploadedAt": "2026-06-05T10:10:00Z"
  }
}
```

---

## Admin Endpoints

### GET /admin/support/tickets
View all support tickets across the platform.

**Auth**: Admin (JWT required)
**Query Params**: status, category, priority, userId, dateFrom, dateTo, page, limit, sortBy, sortOrder, search
**Response** (200): Paginated ticket list.

### GET /admin/support/disputes
View all disputes across the platform.

**Auth**: Admin (JWT required)
**Query Params**: status, bookingId, dateFrom, dateTo, page, limit, sortBy, sortOrder
**Response** (200): Paginated dispute list.

### PATCH /admin/support/tickets/:id/status
Update ticket status.

**Auth**: Admin (JWT required)
**Request Body**:
```json
{
  "status": "in_progress"
}
```
**Response** (200): Updated ticket object.

### PATCH /admin/support/disputes/:id/status
Update dispute status.

**Auth**: Admin (JWT required)
**Request Body**:
```json
{
  "status": "under_review"
}
```
**Response** (200): Updated dispute object.

### PATCH /admin/support/disputes/:id/resolve
Resolve a dispute.

**Auth**: Admin (JWT required)
**Request Body**:
```json
{
  "resolution": "Provider failed to complete service. Full refund issued to customer.",
  "resolvedInFavorOf": "customer"
}
```
**Response** (200): Updated dispute object with resolution details.

---

## Error Responses

All endpoints return structured errors:
```json
{
  "success": false,
  "message": "Validation failed",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    { "field": "subject", "message": "Subject is required" }
  ]
}
```

Common error codes: `VALIDATION_ERROR`, `NOT_FOUND`, `FORBIDDEN`, `UNAUTHORIZED`, `INVALID_STATUS_TRANSITION`, `FILE_TOO_LARGE`, `INVALID_FILE_TYPE`, `DISPUTE_ALREADY_EXISTS`, `BOOKING_NOT_ELIGIBLE`.
