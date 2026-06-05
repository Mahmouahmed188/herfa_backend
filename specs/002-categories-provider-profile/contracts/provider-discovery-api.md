# Provider Discovery API Contract

## Base URL: `/api` (or root)

---

## Provider Category Selection

### POST /providers/categories

Select categories for the authenticated provider's profile.

**Access**: Provider (JWT)

**Request Body**:
```json
{
  "categoryIds": ["uuid1", "uuid2", "uuid3"]
}
```

**Validation**:
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| categoryIds | string[] | Yes | Array of UUIDs, min 1, max 20, all IDs must exist |

**Response 201**:
```json
{
  "success": true,
  "data": {
    "providerId": "uuid",
    "categories": [
      { "id": "uuid", "name": "Plumbing" },
      { "id": "uuid", "name": "Electrical" }
    ]
  }
}
```

**Response 400** (invalid category IDs):
```json
{
  "success": false,
  "message": "One or more category IDs do not exist",
  "errorCode": "INVALID_CATEGORY_IDS"
}
```

---

### GET /providers/categories

Get categories assigned to the authenticated provider.

**Access**: Provider (JWT)

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Plumbing",
      "description": "Plumbing services",
      "icon": "plumbing-icon",
      "sortOrder": 1
    }
  ]
}
```

---

### DELETE /providers/categories/:categoryId

Remove a category from the authenticated provider.

**Access**: Provider (JWT)

**Response 200**:
```json
{
  "success": true,
  "message": "Category removed from profile"
}
```

---

## Public Provider Discovery

### GET /providers

List and search providers with filters.

**Access**: Public

**Query Parameters**:
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| categoryId | uuid | No | — | Filter by category |
| isAvailable | boolean | No | — | Filter by availability |
| latitude | number | No | — | For geo-search |
| longitude | number | No | — | For geo-search |
| radiusKm | number | No | — | Search radius |
| sortBy | enum | No | "experience" | `experience` or `rating` |
| sortOrder | enum | No | "DESC" | `ASC` or `DESC` |
| page | number | No | 1 | Page number |
| limit | number | No | 20 | Items per page (max 100) |

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "businessName": "ABC Plumbing",
      "bio": "Expert plumber with 10 years experience",
      "profileImage": "https://example.com/profile.jpg",
      "experienceYears": 10,
      "rating": 4.5,
      "totalJobsCompleted": 150,
      "isAvailable": true,
      "categories": [
        { "id": "uuid", "name": "Plumbing" }
      ],
      "distanceKm": 2.5
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### GET /providers/:id

Get full provider profile by ID.

**Access**: Public

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "businessName": "ABC Plumbing",
    "bio": "Expert plumber with 10 years experience",
    "profileImage": "https://example.com/profile.jpg",
    "experienceYears": 10,
    "rating": 4.5,
    "totalJobsCompleted": 150,
    "isAvailable": true,
    "categories": [
      { "id": "uuid", "name": "Plumbing" }
    ],
    "services": [
      { "id": "uuid", "name": "Pipe Repair", "price": 150.00 }
    ],
    "createdAt": "2026-01-01T00:00:00Z"
  }
}
```

---

## Admin Provider Management

### PATCH /admin/providers/:profileId/verify

Verify a provider's profile.

**Access**: Admin, SuperAdmin

**Request Body**:
```json
{
  "status": "verified"
}
```

**Validation**: Status must be `verified` or `rejected`

**Response 200**:
```json
{
  "success": true,
  "message": "Provider verification status updated to verified"
}
```

---

### PATCH /admin/providers/:profileId/suspend

Suspend/reactivate a provider.

**Access**: Admin, SuperAdmin

**Request Body**:
```json
{
  "isSuspended": true
}
```

**Response 200**:
```json
{
  "success": true,
  "message": "Provider has been suspended"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_CATEGORY_IDS | 400 | Provided category IDs don't exist |
| PROVIDER_PROFILE_NOT_FOUND | 404 | Provider profile not found |
| FORBIDDEN | 403 | Insufficient role permissions |
| VALIDATION_ERROR | 400 | Invalid request body |
| DUPLICATE_CATEGORY | 409 | Category already assigned to provider |
