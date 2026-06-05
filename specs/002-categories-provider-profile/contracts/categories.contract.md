# Categories Interface Contract

## Endpoints

### GET /categories
Retrieve a list of active categories.

**Authentication**: Optional (Access Token)

**Response (200 OK)**:
```json
[
  {
    "id": "uuid",
    "name": "Plumbing",
    "description": "Pipe fixing and installation",
    "icon": "plumbing-icon.svg",
    "isActive": true
  }
]
```

### POST /categories
Create a new category.

**Authentication**: Required (Role: ADMIN)

**Request Body**: `CreateCategoryDto`
```json
{
  "name": "Electrical",
  "description": "Wiring and lighting services",
  "icon": "electrical-icon.svg"
}
```

**Response (201 Created)**: `CategoryDto`

### PATCH /categories/:id
Update an existing category.

**Authentication**: Required (Role: ADMIN)

**Request Body**: `UpdateCategoryDto`

### DELETE /categories/:id
Deactivate or delete a category.

**Authentication**: Required (Role: ADMIN)
