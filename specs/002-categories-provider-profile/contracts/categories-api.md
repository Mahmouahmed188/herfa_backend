# Categories API Contract

## Base URL: `/api` (or root)

---

## Public Endpoints

### GET /categories

List all active categories.

**Access**: Public (no auth required)

**Query Parameters**:
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| includeInactive | boolean | No | false | Admin only — include inactive categories |

**Response 200**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Plumbing",
      "description": "Plumbing services",
      "icon": "plumbing-icon-url",
      "image": null,
      "sortOrder": 1,
      "serviceCount": 5
    }
  ]
}
```

---

### GET /categories/:id

Get a single category by ID.

**Access**: Public

**Response 200**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Plumbing",
    "description": "Plumbing services",
    "icon": "plumbing-icon-url",
    "image": null,
    "isActive": true,
    "sortOrder": 1,
    "services": [
      { "id": "uuid", "name": "Pipe Repair", "basePrice": 150.00 }
    ],
    "createdAt": "2026-01-01T00:00:00Z",
    "updatedAt": "2026-01-01T00:00:00Z"
  }
}
```

**Response 404**:
```json
{
  "success": false,
  "message": "Category not found",
  "errorCode": "CATEGORY_NOT_FOUND"
}
```

---

## Admin Endpoints

### POST /admin/categories

Create a new category.

**Access**: Admin, SuperAdmin (JWT + RolesGuard)

**Request Body**:
```json
{
  "name": "Carpentry",
  "description": "Carpentry and woodwork services",
  "icon": "carpentry-icon",
  "image": "https://example.com/carpentry.jpg",
  "sortOrder": 5
}
```

**Validation**:
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| name | string | Yes | 2-100 chars, unique |
| description | string | No | Max 500 chars |
| icon | string | No | Max 255 chars |
| image | string | No | Valid URL |
| sortOrder | number | No | Default 0 |

**Response 201**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Carpentry",
    "description": "Carpentry and woodwork services",
    "icon": "carpentry-icon",
    "image": "https://example.com/carpentry.jpg",
    "isActive": true,
    "sortOrder": 5,
    "createdAt": "2026-06-05T00:00:00Z",
    "updatedAt": "2026-06-05T00:00:00Z"
  }
}
```

**Response 409** (duplicate name):
```json
{
  "success": false,
  "message": "Category name already exists",
  "errorCode": "DUPLICATE_CATEGORY_NAME"
}
```

---

### PATCH /admin/categories/:id

Update a category.

**Access**: Admin, SuperAdmin

**Request Body** (all optional):
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "icon": "new-icon",
  "image": "https://example.com/new.jpg",
  "isActive": true,
  "sortOrder": 3
}
```

**Response 200**: Updated category object

---

### DELETE /admin/categories/:id

Soft-delete a category (sets `isActive = false`).

**Access**: Admin, SuperAdmin

**Response 200**:
```json
{
  "success": true,
  "message": "Category deactivated successfully"
}
```

**Response 404**:
```json
{
  "success": false,
  "message": "Category not found",
  "errorCode": "CATEGORY_NOT_FOUND"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| CATEGORY_NOT_FOUND | 404 | Category ID does not exist |
| DUPLICATE_CATEGORY_NAME | 409 | Category name already taken |
| FORBIDDEN | 403 | Insufficient role permissions |
| VALIDATION_ERROR | 400 | Invalid request body |
