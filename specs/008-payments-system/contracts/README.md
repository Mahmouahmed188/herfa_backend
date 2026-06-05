# API Contracts: Payments System

Base URL: `/api`

All endpoints require `Authorization: Bearer <jwt_token>` header.

---

## Customer Endpoints

### GET /payments

List authenticated customer's payments with filtering and pagination.

**Query Parameters**:

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| status | string | No | Filter by payment status |
| paymentMethod | string | No | Filter by payment method |
| bookingId | string | No | Filter by booking |
| dateFrom | string (ISO) | No | Start date range |
| dateTo | string (ISO) | No | End date range |
| search | string | No | Search by payment number |
| sortBy | string | No | Field to sort by (createdAt, amount, status) |
| sortOrder | string | No | asc or desc (default: desc) |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page (default: 20, max: 100) |

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "paymentNumber": "PAY-20260605-A3F9K2",
      "amount": 250.00,
      "currency": "EGP",
      "paymentMethod": "credit_card",
      "paymentStatus": "paid",
      "transactionReference": "txn_abc123",
      "booking": {
        "id": "uuid",
        "bookingNumber": "BK-001"
      },
      "notes": null,
      "paidAt": "2026-06-05T10:30:00Z",
      "createdAt": "2026-06-05T10:30:00Z",
      "updatedAt": "2026-06-05T10:30:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

### GET /payments/:id

Get payment details by ID (customer's own payments only).

**Response 200**: Same payment object structure as list.

**Response 403**:
```json
{
  "success": false,
  "message": "Access denied",
  "errorCode": "FORBIDDEN"
}
```

---

## Provider Endpoints

### GET /provider/payments

List payments related to the provider's own bookings.

**Query Parameters**: Same as customer payments endpoint.

**Response 200**: Same paginated response structure.

### GET /provider/payments/:id

Get payment detail (only if related to provider's own bookings).

---

## Admin Endpoints

### GET /admin/payments

List all payments across the platform.

**Query Parameters**: Same as customer + ability to filter by customerId and providerId.

### GET /admin/payments/:id

Get any payment detail.

### PATCH /admin/payments/:id/status

Update payment status.

**Request Body**:
```json
{
  "status": "paid",
  "notes": "Payment confirmed via bank transfer"
}
```

**Validation Rules**:
- `status` must be a valid payment status
- Transition must be valid (e.g., authorized → paid ✅, pending → refunded ❌)

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "paymentStatus": "paid",
    "updatedAt": "2026-06-05T11:00:00Z"
  }
}
```

**Response 400**:
```json
{
  "success": false,
  "message": "Invalid status transition from 'pending' to 'refunded'",
  "errorCode": "INVALID_TRANSITION"
}
```

### POST /admin/payments/:id/refund

Process a refund against a paid payment.

**Request Body**:
```json
{
  "amount": 50.00,
  "reason": "Customer requested partial refund for incomplete service"
}
```

**Validation Rules**:
- `amount` must be greater than 0
- `amount` must not exceed the original payment amount minus existing refunds
- Payment must be in `paid` or `partially_refunded` status
- `reason` is required

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "paymentId": "uuid",
    "refundAmount": 50.00,
    "refundReason": "Customer requested partial refund for incomplete service",
    "refundedBy": "uuid",
    "refundedAt": "2026-06-05T11:30:00Z",
    "createdAt": "2026-06-05T11:30:00Z"
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| UNAUTHORIZED | 401 | Missing or invalid JWT |
| FORBIDDEN | 403 | Insufficient role/permissions |
| NOT_FOUND | 404 | Payment or booking not found |
| INVALID_TRANSITION | 400 | Invalid payment status transition |
| INVALID_REFUND | 400 | Refund validation failed |
| VALIDATION_ERROR | 400 | Request body validation failed |
| INTERNAL_ERROR | 500 | Unexpected server error |
