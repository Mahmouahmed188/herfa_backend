# Users Interface Contract

## Endpoints

### GET /users/me
Retrieve current authenticated user profile.

**Authentication**: Required (Access Token)

**Response (200 OK)**: `UserProfileDto`
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "role": "CUSTOMER",
  "isActive": true
}
```

### PATCH /users/me
Update current user profile.

**Authentication**: Required (Access Token)

**Request Body**: `UpdateUserProfileDto`
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phone": "+1999999999"
}
```

**Response (200 OK)**: `UserProfileDto`
```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.doe@example.com",
  "phone": "+1999999999",
  "role": "CUSTOMER",
  "isActive": true
}
```
