# Quickstart: Address Management System

**Date**: 2026-06-05 | **Input**: [spec.md](spec.md), [data-model.md](data-model.md)

## Prerequisites

- Dev server running: `npm run start:dev`
- JWT token for a customer user
- JWT token for an admin user

## Endpoints

### 1. Create Address

```bash
curl -X POST http://localhost:3000/api/v1/addresses \
  -H "Authorization: Bearer <customer_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Home",
    "fullAddress": "42 Nile Street, Building 7",
    "buildingNumber": "7",
    "floorNumber": 3,
    "apartmentNumber": 12,
    "city": "Cairo",
    "area": "Zamalek",
    "latitude": 30.0643,
    "longitude": 31.2153
  }'
```

**Expected**: HTTP 201 with `AddressResponseDto` containing `isDefault: false`.

---

### 2. Set as Default Address

```bash
curl -X PATCH http://localhost:3000/api/v1/addresses/<address_id>/set-default \
  -H "Authorization: Bearer <customer_jwt>"
```

**Expected**: HTTP 200 with the address now having `isDefault: true`.

---

### 3. List Addresses (with pagination)

```bash
curl -X GET "http://localhost:3000/api/v1/addresses?page=1&limit=10&sortBy=createdAt&sortOrder=DESC" \
  -H "Authorization: Bearer <customer_jwt>"
```

**Expected**: HTTP 200 with `{ data: [...], meta: { page, limit, total, totalPages } }`.
Default addresses appear before non-default ones.

---

### 4. Get Address by ID

```bash
curl -X GET http://localhost:3000/api/v1/addresses/<address_id> \
  -H "Authorization: Bearer <customer_jwt>"
```

**Expected**: HTTP 200 with single `AddressResponseDto`.

---

### 5. Update Address

```bash
curl -X PATCH http://localhost:3000/api/v1/addresses/<address_id> \
  -H "Authorization: Bearer <customer_jwt>" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Work",
    "floorNumber": 15
  }'
```

**Expected**: HTTP 200 with updated address.

---

### 6. Delete Address

```bash
curl -X DELETE http://localhost:3000/api/v1/addresses/<address_id> \
  -H "Authorization: Bearer <customer_jwt>"
```

**Expected**: HTTP 204 No Content.

---

### 7. Admin: List Customer Addresses

```bash
curl -X GET "http://localhost:3000/api/v1/admin/addresses?userId=<customer_uuid>" \
  -H "Authorization: Bearer <admin_jwt>"
```

**Expected**: HTTP 200 with paginated addresses.

---

### 8. Admin: Get Address by ID

```bash
curl -X GET http://localhost:3000/api/v1/admin/addresses/<address_id> \
  -H "Authorization: Bearer <admin_jwt>"
```

**Expected**: HTTP 200 with single `AddressResponseDto`.

---

## Acceptance Test Scenarios

### US1 — Customer manages addresses (MVP)

1. Create address → expect 201 with `isDefault: false`
2. Verify it appears in list → GET /addresses returns the created address
3. Set as default → PATCH /addresses/:id/set-default → expect 200 with `isDefault: true`
4. Create another address → expect 201 with `isDefault: false`
5. Set second as default → first address's `isDefault` becomes false
6. Update label → PATCH /addresses/:id → expect updated label in response
7. Delete → DELETE /addresses/:id → expect 204
8. Verify deletion → GET /addresses/:id → expect 404
9. Ownership check → try GET on another user's address → expect 403
10. Coordinate validation → POST with lat=100 → expect 400

### US2 — Address during booking (integration)

1. Customer has addresses, one set as default
2. Create booking without explicit address → default address snapshot used
3. Update original address → booking snapshot unchanged

### US3 — Admin view (read-only)

1. Admin GET /admin/addresses?userId=<id> → paginated list
2. Admin POST/PATCH/DELETE → 403

## Validation Error Examples

### Missing required field

```json
{
  "success": false,
  "message": "label should not be empty",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    { "field": "label", "message": "label should not be empty" }
  ]
}
```

### Invalid coordinate

```json
{
  "success": false,
  "message": "latitude must not be greater than 90",
  "errorCode": "VALIDATION_ERROR",
  "errors": [
    { "field": "latitude", "message": "latitude must not be greater than 90" }
  ]
}
```
