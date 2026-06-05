# Auth Interface Contract

## Endpoints

### POST /auth/register
Register a new user (Customer or Provider).

**Request Body**: `RegisterUserDto`
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "password": "SecurePassword123!",
  "role": "CUSTOMER"
}
```

**Response (201 Created)**: `UserProfileDto`
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

### POST /auth/login
Authenticate user and return tokens.

**Request Body**: `LoginDto`
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "jwt-token",
  "user": { ...UserProfileDto }
}
```

### POST /auth/refresh
Refresh access token using refresh token.

**Request Body**:
```json
{
  "refreshToken": "jwt-token"
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "jwt-token",
  "refreshToken": "jwt-token"
}
```

### POST /auth/logout
Invalidate current session.

**Authentication**: Required (Access Token)

**Response (204 No Content)**
