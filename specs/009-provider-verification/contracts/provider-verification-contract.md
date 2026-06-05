# API Contract: Provider Verification System

**Base Path**: `api/v1/provider-verification` (provider) / `api/v1/admin/provider-verifications` (admin)
**Auth**: JWT Bearer token required on all endpoints
**Response Format**: `{ data: ..., timestamp: ... }` (wrapped by global TransformInterceptor)
**Error Format**: `{ statusCode, message, error, timestamp, path }` (from AllExceptionsFilter)

---

## Provider Endpoints

### POST /provider-verification/submit

Submit verification request (changes status from pending → under_review).

**Auth**: JWT (Provider role)
**Request Body**: None (uses authenticated user's provider profile)
**Validation**: Provider profile must exist; at least one identity document must be uploaded.

**Success Response** (201):
```json
{
  "data": {
    "id": "uuid",
    "status": "under_review",
    "submittedAt": "2026-06-05T10:00:00.000Z",
    "message": "Verification submitted successfully"
  }
}
```

**Error Responses**:
- `400`: `{ "message": "Required documents not uploaded. Please upload at least one identity document.", "errorCode": "MISSING_DOCUMENTS" }`
- `400`: `{ "message": "Verification already submitted. Your application is currently under review.", "errorCode": "ALREADY_SUBMITTED" }`
- `404`: `{ "message": "Provider profile not found", "errorCode": "PROFILE_NOT_FOUND" }`

**Events Emitted**: `verification.submitted`

---

### GET /provider-verification/status

Get current verification status.

**Auth**: JWT (Provider role)
**Query**: None

**Success Response** (200):
```json
{
  "data": {
    "id": "uuid",
    "status": "under_review",
    "submittedAt": "2026-06-05T10:00:00.000Z",
    "reviewedAt": null,
    "reviewedBy": null,
    "rejectionReason": null,
    "suspensionReason": null
  }
}
```

**Error Responses**:
- `404`: `{ "message": "No verification record found", "errorCode": "NOT_FOUND" }`

---

### GET /provider-verification/documents

List all uploaded documents for the current provider.

**Auth**: JWT (Provider role)

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "documentType": "national_id",
      "documentUrl": "/uploads/abc123.pdf",
      "originalName": "id-card.pdf",
      "mimeType": "application/pdf",
      "fileSize": 204800,
      "uploadedAt": "2026-06-05T09:00:00.000Z"
    }
  ]
}
```

---

### POST /provider-verification/documents

Upload a verification document.

**Auth**: JWT (Provider role)
**Body**: multipart/form-data
- `file`: File (jpg, jpeg, png, pdf; max 10MB)
- `documentType`: String (national_id, passport, driver_license, professional_license, commercial_registration)

**Success Response** (201):
```json
{
  "data": {
    "id": "uuid",
    "documentType": "national_id",
    "documentUrl": "/uploads/abc123.pdf",
    "originalName": "id-card.pdf",
    "uploadedAt": "2026-06-05T09:00:00.000Z"
  }
}
```

**Error Responses**:
- `400`: `{ "message": "Invalid file type. Accepted: jpg, jpeg, png, pdf", "errorCode": "INVALID_FILE_TYPE" }`
- `400`: `{ "message": "File size exceeds 10MB limit", "errorCode": "FILE_TOO_LARGE" }`
- `400`: `{ "message": "Cannot modify documents while verification is under review", "errorCode": "LOCKED" }`

---

### DELETE /provider-verification/documents/:id

Delete an uploaded document.

**Auth**: JWT (Provider role)
**Params**: `id` — Document UUID

**Success Response** (200):
```json
{
  "data": {
    "message": "Document deleted successfully"
  }
}
```

**Error Responses**:
- `400`: `{ "message": "Cannot delete documents while verification is under review", "errorCode": "LOCKED" }`
- `404`: `{ "message": "Document not found", "errorCode": "NOT_FOUND" }`

---

## Admin Endpoints

### GET /admin/provider-verifications

List all provider verifications with filtering, pagination, and sorting.

**Auth**: JWT (Admin role)
**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | String | No | Filter by status (pending, under_review, approved, rejected, suspended) |
| search | String | No | Search by provider name |
| categoryId | UUID | No | Filter by provider category |
| dateFrom | ISO Date | No | Filter by submission date (start) |
| dateTo | ISO Date | No | Filter by submission date (end) |
| page | Integer | No | Page number (default: 1) |
| limit | Integer | No | Items per page (default: 10, max: 100) |
| sortBy | String | No | Sort field (submittedAt, status, providerName; default: submittedAt) |
| sortOrder | String | No | Sort direction (asc, desc; default: desc) |

**Success Response** (200):
```json
{
  "data": [
    {
      "id": "uuid",
      "providerId": "uuid",
      "providerName": "John's Plumbing",
      "providerEmail": "john@example.com",
      "status": "under_review",
      "submittedAt": "2026-06-05T10:00:00.000Z",
      "reviewedAt": null,
      "reviewedBy": null,
      "documentCount": 2
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}
```

---

### GET /admin/provider-verifications/:id

Get full details of a single verification including documents and history.

**Auth**: JWT (Admin role)
**Params**: `id` — Verification UUID

**Success Response** (200):
```json
{
  "data": {
    "id": "uuid",
    "provider": {
      "id": "uuid",
      "businessName": "John's Plumbing",
      "email": "john@example.com",
      "phone": "+1234567890"
    },
    "status": "under_review",
    "submittedAt": "2026-06-05T10:00:00.000Z",
    "reviewedAt": null,
    "reviewedBy": null,
    "rejectionReason": null,
    "suspensionReason": null,
    "documents": [
      {
        "id": "uuid",
        "documentType": "national_id",
        "documentUrl": "/uploads/abc123.pdf",
        "uploadedAt": "2026-06-05T09:00:00.000Z"
      }
    ],
    "history": [
      {
        "id": "uuid",
        "oldStatus": null,
        "newStatus": "pending",
        "changedBy": "uuid",
        "changedByRole": "provider",
        "notes": "Verification record created",
        "createdAt": "2026-06-05T08:00:00.000Z"
      },
      {
        "id": "uuid",
        "oldStatus": "pending",
        "newStatus": "under_review",
        "changedBy": "uuid",
        "changedByRole": "provider",
        "notes": "Provider submitted verification",
        "createdAt": "2026-06-05T10:00:00.000Z"
      }
    ]
  }
}
```

---

### PATCH /admin/provider-verifications/:id/approve

Approve a provider's verification (changes status from under_review → approved).

**Auth**: JWT (Admin role)
**Params**: `id` — Verification UUID
**Body** (optional):
```json
{
  "notes": "All documents verified and authentic"
}
```

**Success Response** (200):
```json
{
  "data": {
    "id": "uuid",
    "status": "approved",
    "message": "Provider verification approved successfully"
  }
}
```

**Error Responses**:
- `400`: `{ "message": "Only applications under review can be approved", "errorCode": "INVALID_STATUS" }`
- `400`: `{ "message": "Admins cannot approve their own provider verification", "errorCode": "SELF_APPROVAL" }`

**Events Emitted**: `verification.approved`

---

### PATCH /admin/provider-verifications/:id/reject

Reject a provider's verification (changes status from under_review → rejected).

**Auth**: JWT (Admin role)
**Params**: `id` — Verification UUID
**Body**:
```json
{
  "reason": "National ID is blurry and unreadable. Please upload a clearer image.",
  "notes": "Provider contacted via email about the issue"
}
```

**Success Response** (200):
```json
{
  "data": {
    "id": "uuid",
    "status": "rejected",
    "message": "Provider verification rejected"
  }
}
```

**Error Responses**:
- `400`: `{ "message": "Rejection reason is required", "errorCode": "REASON_REQUIRED" }`
- `400`: `{ "message": "Only applications under review can be rejected", "errorCode": "INVALID_STATUS" }`

**Events Emitted**: `verification.rejected`

---

### PATCH /admin/provider-verifications/:id/suspend

Suspend an approved provider (changes status from approved → suspended).

**Auth**: JWT (Admin role)
**Params**: `id` — Verification UUID
**Body**:
```json
{
  "reason": "Multiple customer complaints about incomplete work. Investigation ongoing.",
  "notes": "Temporary suspension pending investigation"
}
```

**Success Response** (200):
```json
{
  "data": {
    "id": "uuid",
    "status": "suspended",
    "message": "Provider suspended successfully"
  }
}
```

**Error Responses**:
- `400`: `{ "message": "Suspension reason is required", "errorCode": "REASON_REQUIRED" }`
- `400`: `{ "message": "Only approved providers can be suspended", "errorCode": "INVALID_STATUS" }`

**Events Emitted**: `verification.suspended`

---

### PATCH /admin/provider-verifications/:id/reactivate

Reactivate a suspended provider (changes status from suspended → approved).

**Auth**: JWT (Admin role)
**Params**: `id` — Verification UUID
**Body** (optional):
```json
{
  "notes": "Investigation complete. Provider was found compliant."
}
```

**Success Response** (200):
```json
{
  "data": {
    "id": "uuid",
    "status": "approved",
    "message": "Provider reactivated successfully"
  }
}
```

**Error Responses**:
- `400`: `{ "message": "Only suspended providers can be reactivated", "errorCode": "INVALID_STATUS" }`

**Events Emitted**: `verification.reactivated`

---

## Notification Events

| Event Name | Payload | Triggered By |
|------------|---------|-------------|
| `verification.submitted` | `{ verificationId, providerId, providerName, status }` | Provider submits |
| `verification.approved` | `{ verificationId, providerId, providerName, status }` | Admin approves |
| `verification.rejected` | `{ verificationId, providerId, providerName, status, reason }` | Admin rejects |
| `verification.suspended` | `{ verificationId, providerId, providerName, status, reason }` | Admin suspends |
| `verification.reactivated` | `{ verificationId, providerId, providerName, status }` | Admin reactivates |

---

## Audit Log Actions

| Action | Entity Type | Metadata |
|--------|-------------|----------|
| `DOCUMENT_UPLOADED` | `verification_document` | `{ documentType, fileSize }` |
| `VERIFICATION_SUBMITTED` | `provider_verification` | `{ previousStatus: 'pending', newStatus: 'under_review' }` |
| `VERIFICATION_APPROVED` | `provider_verification` | `{ previousStatus: 'under_review', newStatus: 'approved' }` |
| `VERIFICATION_REJECTED` | `provider_verification` | `{ previousStatus: 'under_review', newStatus: 'rejected', reason }` |
| `VERIFICATION_SUSPENDED` | `provider_verification` | `{ previousStatus: 'approved', newStatus: 'suspended', reason }` |
| `VERIFICATION_REACTIVATED` | `provider_verification` | `{ previousStatus: 'suspended', newStatus: 'approved' }` |

---

## Swagger Documentation Requirements

Every endpoint must include:
- `@ApiTags('Provider Verification')` / `@ApiTags('Admin - Provider Verifications')`
- `@ApiOperation({ summary, description })`
- `@ApiBearerAuth()` for JWT
- Request DTOs with `@ApiProperty()` / `@ApiPropertyOptional()` decorators
- Response DTOs with example values
- `@ApiResponse({ status, description, type })` for success and error responses
- `@ApiConsumes('multipart/form-data')` on document upload endpoints
- `@ApiBody({ type, description })` on file upload endpoints
