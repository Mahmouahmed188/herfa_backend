# Providers Interface Contract

## Endpoints

### GET /providers
Search and filter providers.

**Query Parameters**:
- `categoryId` (optional): Filter by category
- `sortBy` (optional): `rating` | `experience`
- `sortOrder` (optional): `asc` | `desc`
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "uuid",
      "bio": "Experienced plumber",
      "experienceYears": 10,
      "averageRating": 4.8,
      "isVerified": true,
      "user": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "categories": [
        { "name": "Plumbing" }
      ]
    }
  ],
  "meta": {
    "total": 120,
    "page": 1,
    "limit": 10
  }
}
```

### GET /providers/:id
Retrieve a specific provider profile.

### PATCH /providers/profile
Update current provider professional profile.

**Authentication**: Required (Role: PROVIDER)

**Request Body**: `UpdateProviderProfileDto`
```json
{
  "bio": "Certified electrician with 5 years experience",
  "experienceYears": 5,
  "profileImage": "electrician-profile.jpg"
}
```

### POST /providers/categories
Link categories to the current provider.

**Authentication**: Required (Role: PROVIDER)

**Request Body**: `ProviderCategoryDto`
```json
{
  "categoryIds": ["uuid1", "uuid2"]
}
```
