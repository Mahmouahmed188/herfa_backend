# Herfa Backend API Documentation

> **Version**: 1.0.0  
> **Base URL**: `/api/v1`  
> **Protocol**: HTTP/REST + WebSocket (Socket.io)  
> **Auth**: JWT Bearer Token  
> **Swagger UI**: `/api/docs`

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Roles & Permissions](#2-user-roles--permissions)
3. [Database Overview](#3-database-overview)
4. [API Reference](#4-api-reference)
   - 4.1 [Authentication](#41-authentication)
   - 4.2 [Users](#42-users)
   - 4.3 [Providers](#43-providers)
   - 4.4 [Customers](#44-customers)
   - 4.5 [Categories](#45-categories)
   - 4.6 [Services (Listings)](#46-services-listings)
   - 4.7 [Bookings](#47-bookings)
   - 4.8 [Jobs](#48-jobs)
   - 4.9 [Payments & Refunds](#49-payments--refunds)
   - 4.10 [Reviews & Ratings](#410-reviews--ratings)
   - 4.11 [Notifications](#411-notifications)
   - 4.12 [Support Tickets & Disputes](#412-support-tickets--disputes)
   - 4.13 [Tenders](#413-tenders)
   - 4.14 [Messages](#414-messages)
   - 4.15 [Real-Time Tracking](#415-real-time-tracking)
   - 4.16 [Admin Dashboard](#416-admin-dashboard)
   - 4.17 [Analytics & Reports](#417-analytics--reports)
   - 4.18 [AI Gateway](#418-ai-gateway)
   - 4.19 [File Uploads](#419-file-uploads)
   - 4.20 [Verification](#420-verification)
   - 4.21 [Provider Verification](#421-provider-verification)
   - 4.22 [Addresses](#422-addresses)
5. [WebSocket Events](#5-websocket-events)
6. [Business Workflows](#6-business-workflows)
7. [Security Overview](#7-security-overview)
8. [Environment Variables](#8-environment-variables)
9. [External Integrations](#9-external-integrations)
10. [Swagger Gap Analysis](#10-swagger-gap-analysis)
11. [API Dependency Map](#11-api-dependency-map)
12. [Backend Architecture](#12-backend-architecture)

---

## 1. System Overview

Herfa is a customer-provider marketplace platform connecting customers with service providers. The backend is built with **NestJS 10** using TypeScript, with **TypeORM** as the primary ORM and **Prisma** for auth/notification services.

### Tech Stack

| Component            | Technology                          |
|----------------------|-------------------------------------|
| Runtime              | Node.js (TypeScript)                |
| Framework            | NestJS 10.3                         |
| ORM                  | TypeORM 0.3 + Prisma                |
| Database             | PostgreSQL (UUID PKs)               |
| Cache / Queue        | Redis + Bull                        |
| Auth                 | Passport (JWT Strategy)             |
| Validation           | class-validator + class-transformer |
| API Docs             | Swagger (@nestjs/swagger 7.3)       |
| File Upload          | Multer (local disk)                 |
| WebSocket            | Socket.io                           |
| Events               | @nestjs/event-emitter               |
| Rate Limiting        | @nestjs/throttler                   |

### API Conventions

- **Global Prefix**: `/api/v1`
- **Response Format**: `{ data: T, timestamp: string }` (wrapped by `TransformInterceptor`)
- **Error Format**: `{ statusCode: number, message: string | string[], error: string, timestamp: string, path: string }`
- **Pagination**: `{ data: T[], meta: { page, limit, total, totalPages }, timestamp: string }`
- **Validation**: Whitelist + forbidNonWhitelisted + implicit conversion
- **IDs**: UUID format throughout
- **Dates**: ISO 8601 strings

---

## 2. User Roles & Permissions

### Roles
| Role          | Description                          |
|---------------|--------------------------------------|
| `customer`    | End-user requesting services         |
| `provider`    | Service provider offering services   |
| `admin`       | Platform administrator               |
| `super_admin` | Super administrator                   |

### Role Hierarchy
```
super_admin > admin > provider, customer
```

### Permission Matrix

| Feature                  | customer | provider | admin | super_admin |
|--------------------------|:--------:|:--------:|:-----:|:-----------:|
| Register / Login         | ✓        | ✓        | ✓     | ✓           |
| View/Edit Own Profile    | ✓        | ✓        | ✓     | ✓           |
| Create Service Listing   | -        | ✓        | -     | -           |
| Create Booking           | ✓        | -        | -     | -           |
| Accept/Reject Booking    | -        | ✓        | -     | -           |
| Assign/Complete Job      | -        | ✓        | -     | -           |
| View Available Jobs      | -        | ✓        | -     | -           |
| Create Review            | ✓        | -        | -     | -           |
| Manage Reviews           | -        | ✓        | ✓     | ✓           |
| Make Payment             | ✓        | -        | -     | -           |
| Receive Payment          | -        | ✓        | -     | -           |
| Manage Payments (Admin)  | -        | -        | ✓     | ✓           |
| Create Support Ticket    | ✓        | ✓        | -     | -           |
| Manage Tickets (Admin)   | -        | -        | ✓     | ✓           |
| Create Dispute           | ✓        | ✓        | -     | -           |
| Resolve Disputes (Admin) | -        | -        | ✓     | ✓           |
| CRUD Categories          | -        | -        | ✓     | ✓           |
| View Dashboard           | -        | ✓        | ✓     | ✓           |
| Manage Users (Admin)     | -        | -        | ✓     | ✓           |
| Approve Verifications    | -        | -        | ✓     | ✓           |
| Manage Announcements     | -        | -        | ✓     | ✓           |
| AI Features              | ✓        | ✓        | ✓     | ✓           |
| View Tracking            | ✓ (own)  | ✓ (own)  | ✓     | ✓           |

### User Statuses
| Status      | Description                          |
|-------------|--------------------------------------|
| `pending`   | Awaiting activation/verification     |
| `active`    | Active and usable                    |
| `inactive`  | Deactivated by user                  |
| `suspended` | Suspended by admin                   |
| `deleted`   | Soft-deleted account                 |

---

## 3. Database Overview

The database uses PostgreSQL with 29+ entity tables. Below is a summary of every table and its key columns.

### Core Entities

| Entity              | Table                  | Key Columns                                                          |
|---------------------|------------------------|----------------------------------------------------------------------|
| User                | `users`                | id, email, phone, passwordHash, role (enum), status, fullName, avatar|
| CustomerProfile     | `customer_profiles`    | id, userId, phone, dateOfBirth, location, preferences                |
| ProviderProfile     | `provider_profiles`    | id, userId, businessName, bio, experience, isAvailable, latitude, longitude |
| ProviderApplication | `provider_applications`| id, userId, status, businessName, categoryId, message                |
| ProviderVerification| `provider_verifications`| id, providerId, status, submittedAt, reviewedBy, reviewNotes        |
| VerificationDocument| `verification_documents`| id, verificationId, documentType, fileUrl, status                    |
| VerificationHistory | `verification_history` | id, verificationId, action, performedBy, reason, notes               |
| RefreshToken        | `refresh_tokens`       | id, userId, token, expiresAt, isRevoked                              |
| Address             | `addresses`            | id, userId, label, street, city, state, zipCode, country, isDefault, latitude, longitude |

### Service Entities

| Entity              | Table                  | Key Columns                                                          |
|---------------------|------------------------|----------------------------------------------------------------------|
| Category            | `categories`           | id, name, description, icon, parentId, isActive, sortOrder           |
| Service (Listing)   | `service_listings`     | id, providerId, categoryId, title, description, price, duration, isActive |
| ServiceImage        | `service_images`       | id, serviceListingId, url, isPrimary, sortOrder                      |
| ProviderService     | `provider_services`    | id, providerId, categoryId, price, duration, isAvailable             |
| ProviderCategory    | `provider_categories`  | id, providerId, categoryId                                           |
| ProviderLocation    | `provider_locations`   | id, providerId, latitude, longitude, address, isActive               |
| ProviderRatingStats | `provider_rating_stats`| id, providerId, averageRating, totalReviews, totalBookings           |
| TechnicianVerification| `technician_verifications`| id, providerId, status, certificationNumber, verifiedAt            |

### Transaction Entities

| Entity              | Table                  | Key Columns                                                          |
|---------------------|------------------------|----------------------------------------------------------------------|
| Booking             | `bookings`             | id, customerId, providerId, serviceId, status, scheduledDate, price, location |
| BookingStatusHistory| `booking_status_history`| id, bookingId, fromStatus, toStatus, changedBy, reason               |
| Job                 | `jobs`                 | id, customerId, providerId, categoryId, title, description, status, latitude, longitude |
| JobAssignment       | `job_assignments`      | id, jobId, providerId, status, assignedAt                             |
| JobStatusHistory    | `job_status_history`   | id, jobId, fromStatus, toStatus, changedBy, reason                    |
| Payment             | `payments`             | id, bookingId, customerId, providerId, amount, status, paymentMethod, transactionRef |
| Refund              | `refunds`              | id, paymentId, refundAmount, refundReason, refundedBy                 |

### Communication Entities

| Entity              | Table                  | Key Columns                                                          |
|---------------------|------------------------|----------------------------------------------------------------------|
| Review              | `reviews`              | id, bookingId, customerId, providerId, rating (1-5), comment, isApproved, isFlagged |
| Notification        | `notifications`        | id, userId, type, title, body, data, isRead, channel                  |
| NotificationAnnouncement| `notification_announcements`| id, title, body, type, audience, status, scheduledAt              |
| SupportTicket       | `support_tickets`      | id, userId, subject, description, status, priority, category         |
| TicketMessage       | `ticket_messages`      | id, ticketId, senderId, message, attachments                          |
| Dispute             | `disputes`             | id, bookingId, raisedBy, raisedAgainst, reason, status, resolution    |
| DisputeEvidence     | `dispute_evidence`     | id, disputeId, fileUrl, description, uploadedBy                       |
| Message             | `messages`             | id, senderId, receiverId, bookingId, content, isRead                  |
| Tender              | `tenders`              | id, customerId, title, description, budget, deadline, status          |
| TenderOffer         | `tender_offers`        | id, tenderId, providerId, amount, notes, status                       |

### Tracking Entities

| Entity              | Table                  | Key Columns                                                          |
|---------------------|------------------------|----------------------------------------------------------------------|
| TrackingSession     | `tracking_sessions`    | id, bookingId, providerId, status, startTime, endTime, routeData     |
| TrackingLocation    | `tracking_locations`   | id, sessionId, latitude, longitude, speed, heading, timestamp         |
| TrackingAuditEvent  | `tracking_audit_events`| id, sessionId, eventType, metadata                                    |

### Monitoring Entities

| Entity              | Table                  | Key Columns                                                          |
|---------------------|------------------------|----------------------------------------------------------------------|
| ModerationLog       | `moderation_logs`      | id, action, entityType, entityId, moderatorId, reason, notes          |
| AuditLog            | `audit_logs`           | id, entityType, entityId, action, performedBy, oldValue, newValue     |
| AdminActivityLog    | `admin_activity_logs`  | id, adminId, action, entityType, entityId, details, ipAddress         |
| AnalyticsSnapshot   | `analytics_snapshots`  | id, snapshotDate, metricType, metricName, metricValue                 |
| AiHealthMonitor     | `ai_health_monitor`    | id, endpoint, status, responseTime, errorRate, lastCheckedAt          |
| AiRequestLog        | `ai_request_logs`      | id, userId, endpoint, requestPayload, responseSummary, status, durationMs |

---

## 4. API Reference

### 4.1 Authentication

Base path: `/api/v1/auth`

| Method | Endpoint             | Auth     | Description                     |
|--------|----------------------|----------|---------------------------------|
| POST   | `/auth/register`     | Public   | Register a new user             |
| POST   | `/auth/login`        | Public   | Login with email/password       |
| POST   | `/auth/refresh`      | Public   | Refresh access token            |
| POST   | `/auth/logout`       | JWT      | Logout and revoke refresh token |
| POST   | `/auth/forgot-password` | Public | Send password reset email       |
| POST   | `/auth/reset-password`  | Public | Reset password with token       |
| POST   | `/auth/change-password` | JWT    | Change current password         |

#### POST `/auth/register`

**Request Body**:
```json
{
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "SecureP@ss123",
  "fullName": "John Doe",
  "role": "customer"
}
```

**Validation**:
- `email`: Valid email, unique
- `phone`: Valid phone format, unique
- `password`: Min 8 chars, must contain uppercase, lowercase, number, special char
- `role`: Must be `customer` or `provider`
- `fullName`: Required, max 255 chars

**Response (201)**:
```json
{
  "data": {
    "user": { "id": "uuid", "email": "...", "fullName": "...", "role": "customer" },
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  },
  "timestamp": "2026-06-10T12:00:00.000Z"
}
```

**Business Rules**:
- Password is hashed with bcrypt (salt rounds 12)
- Creates CustomerProfile or ProviderProfile automatically
- For providers, creates a ProviderApplication (status: pending)
- Generates JWT access token (15min expiry) + refresh token (7d expiry)
- Refresh token stored in DB with expiry

#### POST `/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecureP@ss123"
}
```

**Response (200)**:
```json
{
  "data": {
    "user": {
      "id": "uuid",
      "email": "...",
      "fullName": "...",
      "role": "customer",
      "status": "active"
    },
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  },
  "timestamp": "..."
}
```

**Business Rules**:
- Returns 401 if invalid credentials
- Returns 403 if user status is `inactive`, `suspended`, or `deleted`
- Last login timestamp updated
- Old refresh tokens are revoked on new login

#### POST `/auth/refresh`

**Request Body**:
```json
{
  "refreshToken": "jwt..."
}
```

**Response (200)**: Same structure as login (new access + refresh tokens)

**Business Rules**:
- Validates token signature and expiry
- Verifies token exists in DB and is not revoked
- Old refresh token is revoked
- Returns 401 for expired/revoked tokens

#### POST `/auth/logout`

**Auth**: JWT Bearer Token

**Request Body**:
```json
{
  "refreshToken": "jwt..."
}
```

**Response (200)**: `{ "data": { "message": "Logged out successfully" }, "timestamp": "..." }`

**Business Rules**: Refresh token is revoked

#### POST `/auth/forgot-password`

**Request Body**:
```json
{
  "email": "user@example.com"
}
```

**Response (200)**: `{ "data": { "message": "Password reset email sent" }, "timestamp": "..." }`

**Business Rules**:
- Generates reset token (expires 1hr)
- Sends email with reset link (via notification service)
- Always returns success (even if email not found) to prevent enumeration

#### POST `/auth/reset-password`

**Request Body**:
```json
{
  "token": "reset-token",
  "password": "NewSecureP@ss123"
}
```

**Response (200)**: `{ "data": { "message": "Password reset successful" }, "timestamp": "..." }`

#### POST `/auth/change-password`

**Auth**: JWT Bearer Token

**Request Body**:
```json
{
  "currentPassword": "OldP@ss123",
  "newPassword": "NewSecureP@ss123"
}
```

**Response (200)**: `{ "data": { "message": "Password changed successfully" }, "timestamp": "..." }`

**Business Rules**: Current password must match existing; new password validated

---

### 4.2 Users

Base path: `/api/v1/users`

| Method | Endpoint       | Auth | Roles        | Description            |
|--------|----------------|------|--------------|------------------------|
| GET    | `/users/me`    | JWT  | All          | Get current user       |
| PATCH  | `/users/me`    | JWT  | All          | Update current user    |
| GET    | `/users`       | JWT  | admin, super_admin | List all users  |
| GET    | `/users/:id`   | JWT  | admin, super_admin | Get user by ID |
| PATCH  | `/users/:id`   | JWT  | admin, super_admin | Update user     |

#### GET `/users/me`

**Auth**: JWT Bearer Token

**Response (200)**:
```json
{
  "data": {
    "id": "uuid",
    "email": "...",
    "phone": "...",
    "fullName": "...",
    "role": "customer",
    "status": "active",
    "avatar": "...",
    "createdAt": "2026-01-01T00:00:00.000Z"
  },
  "timestamp": "..."
}
```

#### PATCH `/users/me`

**Auth**: JWT Bearer Token

**Request Body** (partial):
```json
{
  "fullName": "New Name",
  "phone": "+9876543210",
  "avatar": "https://..."
}
```

---

### 4.3 Providers

Base path: `/api/v1/providers`

| Method | Endpoint                    | Auth | Roles          | Description                    |
|--------|-----------------------------|------|----------------|--------------------------------|
| POST   | `/providers/apply`          | JWT  | provider       | Submit provider application    |
| GET    | `/providers/profile`        | JWT  | provider       | Get own provider profile       |
| PATCH  | `/providers/profile`        | JWT  | provider       | Update own profile             |
| PATCH  | `/providers/availability`   | JWT  | provider       | Toggle availability            |
| PATCH  | `/providers/location`       | JWT  | provider       | Update location (lat/lng)      |
| GET    | `/providers/services`       | JWT  | provider       | List own services              |
| POST   | `/providers/services`       | JWT  | provider       | Add service to profile         |
| DELETE | `/providers/services/:id`   | JWT  | provider       | Remove service from profile    |
| GET    | `/providers/categories`     | JWT  | provider       | List own categories            |
| POST   | `/providers/categories`     | JWT  | provider       | Add category to profile        |
| DELETE | `/providers/categories/:id` | JWT  | provider       | Remove category from profile   |
| GET    | `/providers/search`         | JWT  | customer, admin | Search providers (geo+filter) |
| GET    | `/providers/nearby`         | JWT  | customer       | Find nearby providers          |
| GET    | `/providers/:id`            | JWT  | All            | Get public provider profile    |
| GET    | `/providers/top-rated`      | JWT  | All            | Get top-rated providers        |

#### POST `/providers/apply`

**Auth**: JWT (provider role)

**Request Body**:
```json
{
  "businessName": "ABC Repairs",
  "categoryId": "uuid",
  "message": "I have 10 years of experience...",
  "experience": 5,
  "phone": "+1234567890"
}
```

**Response (201)**: Application submitted, status: pending

#### GET `/providers/search`

**Auth**: JWT (customer, admin)

**Query Parameters**:
| Parameter    | Type   | Required | Description                   |
|-------------|--------|----------|-------------------------------|
| categoryId  | string | No       | Filter by category            |
| isAvailable | string | No       | "true" / "false"              |
| latitude    | number | No       | Latitude for geo-search       |
| longitude   | number | No       | Longitude for geo-search      |
| radiusKm    | number | No       | Search radius (default: 10km) |
| page        | number | No       | Page number (default: 1)      |
| limit       | number | No       | Items per page (default: 20)  |
| sortBy      | string | No       | Sort field (default: experience) |
| sortOrder   | enum   | No       | ASC / DESC (default: DESC)    |

**Business Rules**:
- Only returns active providers
- Geo-search uses Haversine formula for distance calculation
- Combined filter + geo + sort in single query

---

### 4.4 Customers

Base path: `/api/v1/customers`

| Method | Endpoint                | Auth | Roles    | Description                |
|--------|-------------------------|------|----------|----------------------------|
| GET    | `/customers/profile`    | JWT  | customer | Get own customer profile   |
| PATCH  | `/customers/profile`    | JWT  | customer | Update customer profile    |
| PATCH  | `/customers/location`   | JWT  | customer | Update default location    |

#### GET `/customers/profile`

**Auth**: JWT (customer role)

**Response (200)**:
```json
{
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "phone": "...",
    "dateOfBirth": "1990-01-01",
    "location": { "lat": 30.0, "lng": 31.0 },
    "preferences": { "notifications": true }
  },
  "timestamp": "..."
}
```

---

### 4.5 Categories

Base path: `/api/v1/categories`

| Method | Endpoint                | Auth | Roles          | Description                |
|--------|-------------------------|------|----------------|----------------------------|
| GET    | `/categories`           | JWT  | All            | List all categories        |
| GET    | `/categories/:id`       | JWT  | All            | Get category by ID         |
| POST   | `/categories`           | JWT  | admin, super_admin | Create category        |
| PATCH  | `/categories/:id`       | JWT  | admin, super_admin | Update category        |
| DELETE | `/categories/:id`       | JWT  | admin, super_admin | Delete category        |

#### POST `/categories` (Admin)

**Auth**: JWT (admin/super_admin)

**Request Body**:
```json
{
  "name": "Plumbing",
  "description": "All plumbing services",
  "icon": "plumbing-icon.png",
  "parentId": null,
  "sortOrder": 1,
  "isActive": true
}
```

**Business Rules**:
- Categories are hierarchical (parentId for subcategories)
- Only active categories shown to non-admin users
- Deleting a category with children may cascade or soft-delete

---

### 4.6 Services (Listings)

Base path: `/api/v1/service-listings`

| Method | Endpoint                                    | Auth | Roles    | Description                    |
|--------|---------------------------------------------|------|----------|--------------------------------|
| POST   | `/service-listings`                         | JWT  | provider | Create service listing         |
| GET    | `/service-listings`                         | JWT  | provider | List own listings              |
| GET    | `/service-listings/search`                  | JWT  | All      | Search/filter listings         |
| GET    | `/service-listings/search/:categoryId`      | JWT  | All      | Search by category             |
| GET    | `/service-listings/:id`                     | JWT  | All      | Get listing by ID              |
| PATCH  | `/service-listings/:id`                     | JWT  | provider | Update listing                 |
| DELETE | `/service-listings/:id`                     | JWT  | provider | Delete listing                 |
| POST   | `/service-listings/:id/images`              | JWT  | provider | Add images to listing          |
| DELETE | `/service-listings/:id/images/:imageId`     | JWT  | provider | Remove image from listing      |
| GET    | `/service-listings/:id/images`              | JWT  | All      | Get listing images             |
| POST   | `/service-listings/:id/categories`          | JWT  | provider | Assign category to listing     |
| DELETE | `/service-listings/:id/categories/:catId`   | JWT  | provider | Remove category from listing   |

#### POST `/service-listings`

**Auth**: JWT (provider role)

**Request Body**:
```json
{
  "title": "Fix Leaky Faucet",
  "description": "Professional faucet repair service",
  "price": 150.00,
  "duration": 60,
  "categoryId": "uuid",
  "isActive": true
}
```

**Validation**:
- `title`: Required, 3-100 chars
- `description`: Required, max 2000 chars
- `price`: Required, positive number
- `duration`: Required, minutes, positive integer
- `categoryId`: Must reference existing active category

---

### 4.7 Bookings

Base path: `/api/v1/bookings`

| Method | Endpoint                    | Auth | Roles              | Description                     |
|--------|-----------------------------|------|--------------------|---------------------------------|
| POST   | `/bookings`                 | JWT  | customer           | Create booking                  |
| GET    | `/bookings`                 | JWT  | customer, provider | List own bookings (filtered)    |
| GET    | `/bookings/:id`             | JWT  | owner              | Get booking details             |
| PATCH  | `/bookings/:id/status`      | JWT  | provider           | Update booking status           |
| PATCH  | `/bookings/:id/cancel`      | JWT  | owner              | Cancel booking                  |
| GET    | `/bookings/search`          | JWT  | admin, super_admin | Search all bookings             |

#### POST `/bookings`

**Auth**: JWT (customer role)

**Request Body**:
```json
{
  "serviceListingId": "uuid",
  "providerId": "uuid",
  "scheduledDate": "2026-06-15T14:00:00.000Z",
  "description": "I need help with...",
  "location": {
    "address": "123 Main St",
    "latitude": 30.0444,
    "longitude": 31.2357
  }
}
```

**Response (201)**:
```json
{
  "data": {
    "id": "uuid",
    "status": "pending",
    "customer": { "id": "uuid", "fullName": "..." },
    "provider": { "id": "uuid", "businessName": "..." },
    "service": { "id": "uuid", "title": "..." },
    "scheduledDate": "2026-06-15T14:00:00.000Z",
    "price": 150.00,
    "location": { "address": "...", "latitude": 30.0, "longitude": 31.0 }
  },
  "timestamp": "..."
}
```

**Business Rules**:
- Status machine: `pending` → `accepted` | `rejected` | `cancelled`
- From `accepted`: → `on_the_way` → `in_progress` → `completed` | `cancelled`
- Cancellation allowed only if status is `pending` or `accepted`
- Ownership guard ensures only booking participants can view/modify
- Provider cannot book their own service
- Duplicate booking prevention for same slot

#### PATCH `/bookings/:id/status`

**Auth**: JWT (provider role for the booking's provider)

**Request Body**:
```json
{
  "status": "accepted"
}
```

**Valid Transitions**:
| From          | To                | Notes                            |
|---------------|-------------------|----------------------------------|
| pending       | accepted          | Provider accepts                 |
| pending       | rejected          | Provider rejects                 |
| accepted      | on_the_way        | Provider en route                |
| on_the_way    | in_progress       | Provider started work            |
| in_progress   | completed         | Work done                        |
| in_progress   | cancelled         | Provider cancels during work     |
| pending       | cancelled         | Customer cancels                 |
| accepted      | cancelled         | Customer cancels before arrival  |

---

### 4.8 Jobs

Base path: `/api/v1/jobs`

| Method | Endpoint                        | Auth | Roles              | Description                       |
|--------|----------------------------------|------|--------------------|-----------------------------------|
| POST   | `/jobs`                          | JWT  | customer           | Create a new job                  |
| GET    | `/jobs`                          | JWT  | customer           | List own jobs                     |
| GET    | `/jobs/my-jobs`                  | JWT  | provider           | List assigned jobs                |
| GET    | `/jobs/available`                | JWT  | provider           | List available jobs (geo-search)  |
| GET    | `/jobs/:id`                      | JWT  | owner/provider     | Get job details                   |
| POST   | `/jobs/:id/assign`               | JWT  | provider           | Assign self to job                |
| POST   | `/jobs/:id/accept`               | JWT  | provider           | Accept assigned job               |
| POST   | `/jobs/:id/reject`               | JWT  | provider           | Reject assigned job               |
| PATCH  | `/jobs/:id/status`               | JWT  | provider           | Update job status                 |
| GET    | `/jobs/admin`                    | JWT  | admin, super_admin | Admin: list all jobs              |

#### POST `/jobs`

**Auth**: JWT (customer role)

**Request Body**:
```json
{
  "title": "Fix Leaky Pipe",
  "description": "Kitchen sink leaking",
  "categoryId": "uuid",
  "latitude": 30.0444,
  "longitude": 31.2357,
  "address": "123 Main St",
  "budget": 200,
  "scheduledDate": "2026-06-15T14:00:00.000Z"
}
```

**Response (201)**: Job created + auto-match attempted via Bull queue

**Business Rules**:
- Job status machine: `open` → `assigned` → `in_progress` → `completed` | `cancelled`
- Bull queue processor (`JobMatchingProcessor`) automatically matches jobs to available nearby providers
- Match criteria: same category, within radius, availability status
- Provider can see available jobs within their configured radius

---

### 4.9 Payments & Refunds

Base path: `/api/v1/payments`

| Method | Endpoint                       | Auth | Roles              | Description                   |
|--------|--------------------------------|------|--------------------|-------------------------------|
| GET    | `/payments`                    | JWT  | customer           | List own payments             |
| GET    | `/payments/provider`           | JWT  | provider           | List received payments        |
| GET    | `/payments/:id`                | JWT  | owner              | Get payment details           |
| POST   | `/payments/:id/process`        | JWT  | customer           | Process payment               |
| GET    | `/payments/admin`              | JWT  | admin, super_admin | List all payments             |
| PATCH  | `/payments/admin/:id/status`   | JWT  | admin, super_admin | Update payment status         |
| POST   | `/payments/admin/:id/refund`   | JWT  | admin, super_admin | Issue refund                  |

**Refunds** (via RefundsService):
- `createRefund`: Creates refund record linked to payment
- `getRefundsByPayment`: Lists refunds for a specific payment

**Payment Status Machine**:
```
pending → authorized → paid → refunded
  ↓          ↓                partially_refunded
 failed    cancelled
```

**Business Rules**:
- PaymentGatewayProvider interface defines: authorize, capture, refund, cancel, getStatus
- Payments are associated with bookings
- Only the booking customer can process payment
- Refunds create a Refund entity record
- Admin can update payment status and issue refunds

---

### 4.10 Reviews & Ratings

Base path: `/api/v1/reviews`

| Method | Endpoint                          | Auth | Roles              | Description                     |
|--------|-----------------------------------|------|--------------------|---------------------------------|
| POST   | `/reviews`                        | JWT  | customer           | Create review                   |
| GET    | `/reviews`                        | JWT  | customer           | List own reviews                |
| GET    | `/reviews/provider`               | JWT  | provider           | List reviews about me           |
| GET    | `/reviews/:id`                    | JWT  | All                | Get review by ID                |
| PATCH  | `/reviews/:id`                    | JWT  | owner              | Update own review               |
| DELETE | `/reviews/:id`                    | JWT  | owner              | Delete own review               |
| POST   | `/reviews/:id/flag`               | JWT  | All                | Flag review as inappropriate    |
| PATCH  | `/reviews/:id/moderate`           | JWT  | admin, super_admin | Moderate review (approve/reject)|
| GET    | `/reviews/admin`                  | JWT  | admin, super_admin | List all reviews for moderation |

#### POST `/reviews`

**Auth**: JWT (customer role)

**Request Body**:
```json
{
  "bookingId": "uuid",
  "providerId": "uuid",
  "rating": 5,
  "comment": "Excellent service! Very professional."
}
```

**Validation**:
- `rating`: 1-5 (integer)
- `bookingId`: Must be a completed booking by this customer
- `providerId`: Must be the provider for that booking
- One review per booking (duplicate prevention)

**Business Rules**:
- On creation, recalculates ProviderRatingStats (averageRating, totalReviews)
- Reviews can be flagged for moderation
- Admin can approve or reject flagged reviews
- Only visible if `isApproved = true`

---

### 4.11 Notifications

Base path: `/api/v1/notifications`

| Method | Endpoint                                  | Auth | Roles              | Description                          |
|--------|-------------------------------------------|------|--------------------|--------------------------------------|
| GET    | `/notifications`                          | JWT  | All                | List notifications (paginated)       |
| GET    | `/notifications/unread-count`             | JWT  | All                | Get unread count                     |
| PATCH  | `/notifications/:id/read`                 | JWT  | owner              | Mark notification as read            |
| PATCH  | `/notifications/read-all`                 | JWT  | All                | Mark all as read                     |
| DELETE | `/notifications/:id`                      | JWT  | owner              | Delete notification                  |
| GET    | `/notifications/announcements`            | JWT  | All                | List announcements                   |
| POST   | `/notifications/announcements`            | JWT  | admin, super_admin | Create announcement                  |
| PATCH  | `/notifications/announcements/:id`        | JWT  | admin, super_admin | Update announcement                  |
| DELETE | `/notifications/announcements/:id`        | JWT  | admin, super_admin | Delete announcement                  |

**Business Rules**:
- Two channels: `in_app` and `push` (FCM)
- Events fire via `@nestjs/event-emitter`:
  - `booking.created` → notification to provider
  - `booking.accepted` → notification to customer
  - `job.assigned` → notification to provider
  - `payment.received` → notification to provider
  - `review.created` → notification to provider
  - `message.sent` → notification to receiver
- Duplicate suppression: same notification type + same user within 5 minutes
- Announcements can target specific roles or be broadcast to all

---

### 4.12 Support Tickets & Disputes

Base path: `/api/v1/support`

| Method | Endpoint                       | Auth | Roles              | Description                        |
|--------|--------------------------------|------|--------------------|------------------------------------|
| POST   | `/support/tickets`             | JWT  | customer, provider | Create support ticket              |
| GET    | `/support/tickets`             | JWT  | customer, provider | List own tickets                   |
| GET    | `/support/tickets/:id`         | JWT  | owner/admin        | Get ticket details                 |
| POST   | `/support/tickets/:id/messages`| JWT  | owner/admin        | Add message to ticket              |
| GET    | `/support/tickets/:id/messages`| JWT  | owner/admin        | Get ticket messages                |
| POST   | `/support/disputes`            | JWT  | customer, provider | Create dispute                     |
| GET    | `/support/disputes`            | JWT  | customer, provider | List own disputes                  |
| POST   | `/support/disputes/:id/evidence`| JWT | owner/admin        | Add evidence to dispute            |
| GET    | `/support/disputes/:id/evidence`| JWT | owner/admin        | Get dispute evidence               |

**Admin endpoints**: (in AdminController or SupportAdminController)

| Method | Endpoint                                   | Auth | Roles              | Description                     |
|--------|---------------------------------------------|------|--------------------|---------------------------------|
| GET    | `/support/admin/tickets`                    | JWT  | admin, super_admin | List all tickets                |
| PATCH  | `/support/admin/tickets/:id/status`         | JWT  | admin, super_admin | Update ticket status            |
| PATCH  | `/support/admin/tickets/:id/priority`       | JWT  | admin, super_admin | Update ticket priority          |
| PATCH  | `/support/admin/tickets/:id/assign`         | JWT  | admin, super_admin | Assign ticket to admin          |
| GET    | `/support/admin/disputes`                   | JWT  | admin, super_admin | List all disputes               |
| PATCH  | `/support/admin/disputes/:id/resolve`       | JWT  | admin, super_admin | Resolve dispute with resolution |

**Business Rules**:
- Ticket statuses: `open`, `in_progress`, `waiting_on_customer`, `resolved`, `closed`
- Ticket priorities: `low`, `medium`, `high`, `urgent`
- Dispute statuses: `open`, `under_review`, `resolved`, `dismissed`
- Disputes require a booking reference
- Evidence can be file uploads (images/pdf)

---

### 4.13 Tenders

Base path: `/api/v1/tenders`

| Method | Endpoint                       | Auth | Roles              | Description                        |
|--------|--------------------------------|------|--------------------|------------------------------------|
| POST   | `/tenders`                     | JWT  | customer           | Create tender                      |
| GET    | `/tenders`                     | JWT  | customer           | List own tenders                   |
| GET    | `/tenders/open`                | JWT  | provider           | List open tenders                  |
| GET    | `/tenders/:id`                 | JWT  | owner/provider     | Get tender details                 |
| PATCH  | `/tenders/:id`                 | JWT  | owner              | Update tender                      |
| DELETE | `/tenders/:id`                 | JWT  | owner              | Delete tender                      |
| POST   | `/tenders/:id/offers`          | JWT  | provider           | Create offer on tender             |
| GET    | `/tenders/:id/offers`          | JWT  | owner              | List offers on tender              |
| PATCH  | `/tenders/:id/offers/:offerId/accept` | JWT | owner         | Accept offer                       |
| PATCH  | `/tenders/:id/offers/:offerId/reject`  | JWT | owner         | Reject offer                       |

#### POST `/tenders`

**Auth**: JWT (customer role)

**Request Body**:
```json
{
  "title": "Need House Painting",
  "description": "3-bedroom apartment, 2 coats",
  "budget": 5000,
  "deadline": "2026-07-01T00:00:00.000Z"
}
```

**Business Rules**:
- Tender status: `open`, `in_review`, `awarded`, `completed`, `cancelled`
- Only providers can make offers
- Customer can accept/reject offers
- Once awarded, other offers auto-rejected

---

### 4.14 Messages

Base path: `/api/v1/messages`

| Method | Endpoint                              | Auth | Roles    | Description                       |
|--------|---------------------------------------|------|----------|-----------------------------------|
| POST   | `/messages`                           | JWT  | All      | Send message                      |
| GET    | `/messages/conversations`             | JWT  | All      | List conversations                |
| GET    | `/messages/conversations/:userId`     | JWT  | All      | Get conversation with user        |
| PATCH  | `/messages/conversations/:userId/read`| JWT  | All      | Mark conversation as read         |

#### POST `/messages`

**Auth**: JWT Bearer Token

**Request Body**:
```json
{
  "receiverId": "uuid",
  "bookingId": "uuid",
  "content": "Hi, I'm on my way"
}
```

**Business Rules**:
- Messages associated with booking context
- `isRead` flag tracks read status
- Sending triggers notification event
- Both customer and provider on a booking can message

---

### 4.15 Real-Time Tracking

Base path: `/api/v1/tracking`

| Method | Endpoint                          | Auth | Roles              | Description                        |
|--------|-----------------------------------|------|--------------------|------------------------------------|
| POST   | `/tracking/sessions`              | JWT  | provider           | Start tracking session             |
| PATCH  | `/tracking/sessions/:id/location` | JWT  | provider           | Update location                    |
| PATCH  | `/tracking/sessions/:id/pause`    | JWT  | provider           | Pause tracking                     |
| PATCH  | `/tracking/sessions/:id/resume`   | JWT  | provider           | Resume tracking                    |
| PATCH  | `/tracking/sessions/:id/stop`     | JWT  | provider           | Stop tracking                      |
| GET    | `/tracking/sessions/:id`          | JWT  | owner/customer     | Get session (customer view)        |
| GET    | `/tracking/bookings/:bookingId`   | JWT  | customer           | Get tracking for customer booking  |
| GET    | `/tracking/admin/sessions`        | JWT  | admin, super_admin | List all sessions                  |
| GET    | `/tracking/admin/sessions/:id`    | JWT  | admin, super_admin | Get any session details            |

#### POST `/tracking/sessions`

**Auth**: JWT (provider role)

**Request Body**:
```json
{
  "bookingId": "uuid"
}
```

**Business Rules**:
- Session statuses: `active`, `paused`, `completed`, `cancelled`
- Location updates include: latitude, longitude, speed, heading, timestamp
- Socket.io WebSocket at `/tracking` namespace for real-time location streaming
- Customers receive real-time location updates via WebSocket
- Admin can view all sessions

**WebSocket Events** (TrackingGateway):
- `join-session` → client joins a tracking room
- `leave-session` → client leaves
- `location-update` → broadcast new location to session room
- `session-paused` → broadcast pause event
- `session-resumed` → broadcast resume event
- `session-completed` → broadcast completion

---

### 4.16 Admin Dashboard

Base path: `/api/v1/admin`

| Method | Endpoint                                | Auth | Roles              | Description                          |
|--------|-----------------------------------------|------|--------------------|--------------------------------------|
| GET    | `/admin/dashboard`                      | JWT  | admin, super_admin | Get dashboard stats                  |
| GET    | `/admin/users`                          | JWT  | admin, super_admin | List all users                       |
| PATCH  | `/admin/users/:id/status`               | JWT  | admin, super_admin | Update user status (suspend/activate)|
| GET    | `/admin/applications`                   | JWT  | admin, super_admin | List provider applications           |
| PATCH  | `/admin/applications/:id/approve`       | JWT  | admin, super_admin | Approve provider application         |
| PATCH  | `/admin/applications/:id/reject`        | JWT  | admin, super_admin | Reject provider application          |
| GET    | `/admin/activity-logs`                  | JWT  | admin, super_admin | View admin activity logs             |
| GET    | `/admin/provider-verifications`         | JWT  | admin, super_admin | List all verifications (filtered)    |
| GET    | `/admin/provider-verifications/:id`     | JWT  | admin, super_admin | Get verification details             |
| PATCH  | `/admin/provider-verifications/:id/approve` | JWT | admin, super_admin | Approve verification            |
| PATCH  | `/admin/provider-verifications/:id/reject`  | JWT | admin, super_admin | Reject verification             |
| PATCH  | `/admin/provider-verifications/:id/suspend` | JWT | admin, super_admin | Suspend provider               |
| PATCH  | `/admin/provider-verifications/:id/reactivate` | JWT | admin, super_admin | Reactivate provider          |
| GET    | `/admin/payments`                       | JWT  | admin, super_admin | List all payments                   |
| PATCH  | `/admin/payments/:id/status`            | JWT  | admin, super_admin | Update payment status               |
| POST   | `/admin/payments/:id/refund`            | JWT  | admin, super_admin | Issue refund                        |
| GET    | `/admin/tickets`                        | JWT  | admin, super_admin | List all support tickets             |
| PATCH  | `/admin/tickets/:id/status`             | JWT  | admin, super_admin | Update ticket status                 |
| PATCH  | `/admin/tickets/:id/priority`           | JWT  | admin, super_admin | Update ticket priority               |
| PATCH  | `/admin/tickets/:id/assign`             | JWT  | admin, super_admin | Assign ticket                        |
| GET    | `/admin/disputes`                       | JWT  | admin, super_admin | List all disputes                    |
| PATCH  | `/admin/disputes/:id/resolve`           | JWT  | admin, super_admin | Resolve dispute                      |
| GET    | `/admin/reviews`                        | JWT  | admin, super_admin | List all reviews                     |
| PATCH  | `/admin/reviews/:id/moderate`           | JWT  | admin, super_admin | Moderate review                      |

#### GET `/admin/dashboard`

**Auth**: JWT (admin/super_admin)

**Response (200)**:
```json
{
  "data": {
    "totalUsers": 1500,
    "totalProviders": 350,
    "totalCustomers": 1150,
    "totalBookings": 5200,
    "totalRevenue": 1250000.00,
    "pendingApplications": 23,
    "activeBookings": 145,
    "recentUsers": [...]
  },
  "timestamp": "..."
}
```

---

### 4.17 Analytics & Reports

Base path: `/api/v1/analytics`

| Method | Endpoint                           | Auth | Roles              | Description                        |
|--------|------------------------------------|------|--------------------|------------------------------------|
| GET    | `/analytics/dashboard`             | JWT  | admin, super_admin | Analytics overview dashboard       |
| GET    | `/analytics/users`                 | JWT  | admin, super_admin | User analytics (registrations, growth) |
| GET    | `/analytics/bookings`              | JWT  | admin, super_admin | Booking analytics (volume, trends) |
| GET    | `/analytics/revenue`               | JWT  | admin, super_admin | Revenue analytics (daily/monthly)  |
| GET    | `/analytics/providers`             | JWT  | admin, super_admin | Provider analytics (top, growth)   |
| GET    | `/analytics/reviews`               | JWT  | admin, super_admin | Review analytics (averages, trends)|
| GET    | `/analytics/support`               | JWT  | admin, super_admin | Support analytics (ticket volume, resolution) |
| GET    | `/analytics/geographic`            | JWT  | admin, super_admin | Geographic distribution analysis   |
| GET    | `/analytics/reports/:type`         | JWT  | admin, super_admin | Generate report (CSV/JSON format)  |
| GET    | `/analytics/activity-logs`         | JWT  | admin, super_admin | Activity logs (filtered + paginated)|

**Analytics Service Methods**:
| Method                  | Description                                |
|-------------------------|--------------------------------------------|
| getDashboardOverview()  | Combined KPIs for admin dashboard          |
| getUserAnalytics()      | User registrations, role distribution      |
| getBookingAnalytics()   | Booking volume, status distribution        |
| getRevenueAnalytics()   | Revenue by period, payment method          |
| getProviderAnalytics()  | Top providers, category distribution       |
| getReviewAnalytics()    | Average ratings, review volume             |
| getSupportAnalytics()   | Ticket volume, resolution rate             |
| getGeographicAnalytics()| Location-based user/provider distribution  |
| generateReport(type)    | CSV/JSON download of specified report      |
| getActivityLogs()       | Paginated activity logs with filters       |

---

### 4.18 AI Gateway

Base path: `/api/v1/ai`

| Method | Endpoint                         | Auth | Roles | Description                           |
|--------|----------------------------------|------|-------|---------------------------------------|
| POST   | `/ai/chat`                       | JWT  | All   | Send chat message to AI assistant     |
| POST   | `/ai/classify-service`           | JWT  | All   | Classify service description          |
| POST   | `/ai/analyze-image`              | JWT  | All   | Analyze/describe uploaded image       |
| POST   | `/ai/estimate-cost`              | JWT  | All   | Estimate cost for service description |
| POST   | `/ai/recommend-provider`         | JWT  | All   | Get AI provider recommendation        |
| POST   | `/ai/ocr`                        | JWT  | All   | OCR on uploaded document              |

#### POST `/ai/chat`

**Auth**: JWT Bearer Token

**Request Body**:
```json
{
  "message": "What services do you offer?",
  "context": { "bookingId": "uuid" }
}
```

**Response (200)**:
```json
{
  "data": {
    "reply": "We offer plumbing, electrical, and cleaning services...",
    "confidence": 0.95,
    "processingTime": 1200
  },
  "timestamp": "..."
}
```

#### POST `/ai/analyze-image`

**Auth**: JWT Bearer Token

**Content-Type**: multipart/form-data

**Request Body**: File upload (image)

**Business Rules**:
- Max file size: 10MB
- Max 5 files per request
- Supported: jpg, jpeg, png
- Circuit breaker: stops after 5 consecutive failures (resets after 30s)
- Rate limit: 100 requests/min/user
- Retry: max 3 retries with exponential backoff
- Timeout: 30s per request
- All requests logged to AiRequestLog entity
- AiHealthMonitor tracks endpoint health

---

### 4.19 File Uploads

Base path: `/api/v1/upload`

| Method | Endpoint         | Auth | Roles | Description                    |
|--------|------------------|------|-------|--------------------------------|
| POST   | `/upload`        | JWT  | All   | Upload a file                  |
| POST   | `/upload/images` | JWT  | All   | Upload image only              |
| POST   | `/upload/documents` | JWT | All | Upload document (pdf/image)   |

#### POST `/upload`

**Auth**: JWT Bearer Token

**Content-Type**: multipart/form-data

**Request**: File field (single file)

**Validation**:
- Max size: 5MB
- Allowed types: jpg, jpeg, png, pdf
- File size checked via ParseFilePipe + FileValidator

**Response (201)**:
```json
{
  "data": {
    "url": "/uploads/filename-uuid.jpg",
    "originalName": "photo.jpg",
    "mimeType": "image/jpeg",
    "size": 204800
  },
  "timestamp": "..."
}
```

**Business Rules**:
- Files stored locally at `./uploads/` directory
- Served via ServeStaticModule at `/uploads` path
- Filenames UUID-based to prevent collisions
- No cloud storage provider currently implemented (StorageProvider interface exists for future use)

---

### 4.20 Verification

Base path: `/api/v1/verification` (legacy)

| Method | Endpoint                        | Auth | Roles    | Description                  |
|--------|----------------------------------|------|----------|------------------------------|
| POST   | `/verification/submit`           | JWT  | provider | Submit verification request  |
| GET    | `/verification/status`           | JWT  | provider | Get verification status      |
| GET    | `/verification/admin`            | JWT  | admin, super_admin | List all submissions |
| PATCH  | `/verification/admin/:id/review` | JWT  | admin, super_admin | Review submission   |

---

### 4.21 Provider Verification

Base path: `/api/v1/provider-verifications`

| Method | Endpoint                                    | Auth | Roles              | Description                        |
|--------|---------------------------------------------|------|--------------------|------------------------------------|
| POST   | `/provider-verifications`                   | JWT  | provider           | Submit verification                |
| GET    | `/provider-verifications/mine`              | JWT  | provider           | Get own verification status        |
| GET    | `/provider-verifications/:id`               | JWT  | owner              | Get verification details           |
| POST   | `/provider-verifications/:id/documents`     | JWT  | owner              | Upload verification document       |
| DELETE | `/provider-verifications/:id/documents/:docId` | JWT | owner           | Remove document                    |
| GET    | `/provider-verifications/check/:providerId` | JWT  | admin, super_admin | Check provider verification status |
| GET    | `/provider-verifications/:id/history`       | JWT  | owner              | Get verification history           |

**Admin endpoints**:

| Method | Endpoint                                                    | Auth | Roles              | Description                     |
|--------|--------------------------------------------------------------|------|--------------------|---------------------------------|
| GET    | `/admin/provider-verifications`                              | JWT  | admin, super_admin | List all verifications (filtered) |
| GET    | `/admin/provider-verifications/:id`                          | JWT  | admin, super_admin | Get verification details        |
| PATCH  | `/admin/provider-verifications/:id/approve`                  | JWT  | admin, super_admin | Approve verification            |
| PATCH  | `/admin/provider-verifications/:id/reject`                   | JWT  | admin, super_admin | Reject with reason              |
| PATCH  | `/admin/provider-verifications/:id/suspend`                  | JWT  | admin, super_admin | Suspend provider                |
| PATCH  | `/admin/provider-verifications/:id/reactivate`               | JWT  | admin, super_admin | Reactivate provider             |

**Filtering** (admin list): status, search (provider name), categoryId, dateFrom, dateTo, page, limit, sortBy (submittedAt, status), sortOrder

**Verification Status Machine**:
```
draft → submitted → under_review → approved | rejected
                                      ↓
                                 suspended → approved (reactivated)
```

**Business Rules**:
- Provider submits with basic info + documents
- Documents stored via LocalStorageProvider
- Admin reviews: approve, reject (with reason), suspend, reactivate
- Every action recorded in VerificationHistory
- Audit logs created for admin actions
- VerificationOwnerGuard ensures provider can only access own records

---

### 4.22 Addresses

Base path: `/api/v1/addresses`

| Method | Endpoint                   | Auth | Roles              | Description              |
|--------|----------------------------|------|--------------------|--------------------------|
| POST   | `/addresses`               | JWT  | customer           | Create address           |
| GET    | `/addresses`               | JWT  | customer           | List own addresses       |
| GET    | `/addresses/:id`           | JWT  | owner              | Get address by ID        |
| PATCH  | `/addresses/:id`           | JWT  | owner              | Update address           |
| DELETE | `/addresses/:id`           | JWT  | owner              | Delete address           |
| PATCH  | `/addresses/:id/default`   | JWT  | owner              | Set as default address   |
| GET    | `/addresses/admin`         | JWT  | admin, super_admin | List all addresses       |
| GET    | `/addresses/admin/:id`     | JWT  | admin, super_admin | Get any address          |

#### POST `/addresses`

**Auth**: JWT (customer role)

**Request Body**:
```json
{
  "label": "Home",
  "street": "123 Main St",
  "city": "Cairo",
  "state": "Cairo Governorate",
  "zipCode": "11511",
  "country": "Egypt",
  "latitude": 30.0444,
  "longitude": 31.2357,
  "isDefault": true
}
```

**Business Rules**:
- Only customers can have addresses
- Setting `isDefault: true` unsets default on other addresses
- Admin can view all addresses across the platform

---

## 5. WebSocket Events

### Tracking Namespace (`/tracking`)

#### Client → Server Events
| Event             | Payload                                              | Description                 |
|-------------------|------------------------------------------------------|-----------------------------|
| `join-session`    | `{ sessionId: string }`                              | Join tracking session room  |
| `leave-session`   | `{ sessionId: string }`                              | Leave tracking session room |
| `location-update` | `{ sessionId, latitude, longitude, speed, heading }` | Send current location       |

#### Server → Client Events
| Event                | Payload                                                   | Description                    |
|----------------------|-----------------------------------------------------------|--------------------------------|
| `location-update`    | `{ latitude, longitude, speed, heading, timestamp }`      | Broadcast location to room     |
| `session-paused`     | `{ sessionId, timestamp }`                                | Session paused                 |
| `session-resumed`    | `{ sessionId, timestamp }`                                 | Session resumed                |
| `session-completed`  | `{ sessionId, timestamp }`                                 | Session completed              |
| `error`              | `{ message: string }`                                      | Error notification             |

### Notifications Namespace (`/notifications`)

| Event              | Payload                        | Description                      |
|--------------------|--------------------------------|----------------------------------|
| `notification`     | `{ id, type, title, body, data, createdAt }` | New notification     |

### WebSocket Connection

```javascript
const socket = io('ws://localhost:3000/tracking', {
  auth: { token: 'Bearer <jwt>' }
});

socket.emit('join-session', { sessionId: 'uuid' });
socket.on('location-update', (data) => {
  console.log('Provider location:', data);
});
```

**Authentication**: JWT token passed in `auth.token` on connection

---

## 6. Business Workflows

### 6.1 User Registration

```
User → POST /auth/register (email, password, role)
  │
  ├── role = customer
  │   ├── Create User (status: active)
  │   └── Create CustomerProfile (default values)
  │
  └── role = provider
      ├── Create User (status: pending)
      ├── Create ProviderProfile (empty)
      └── Create ProviderApplication (status: pending)
          └── Admin reviews → approve/reject
```

### 6.2 Provider Verification Flow

```
Provider → POST /provider-verifications (submit)
  │
  ├── Status: draft → submitted
  ├── Upload documents: POST /provider-verifications/:id/documents
  │
  └── Admin reviews:
      ├── PATCH /admin/provider-verifications/:id/approve
      │   └── Status: approved
      │       └── ProviderProfile.isVerified = true
      │
      └── PATCH /admin/provider-verifications/:id/reject
          └── Status: rejected (reason required)
              └── Provider can resubmit

  Later: Admin can suspend/reactivate
```

### 6.3 Service Creation & Booking Flow

```
Provider → POST /service-listings (create service)
  │
  Customer → GET /providers/search (find provider)
  Customer → GET /service-listings/search (find service)
  Customer → POST /bookings (create booking, status: pending)
  │
  Provider ← Notification (booking.created)
  Provider → PATCH /bookings/:id/status (accept/reject)
  │
  ├── Accepted:
  │   ├── Customer notified (booking.accepted)
  │   ├── Provider starts tracking (POST /tracking/sessions)
  │   ├── Status: accepted → on_the_way → in_progress
  │   ├── Customer sees live tracking via WebSocket
  │   ├── Work completed → status: completed
  │   ├── Payment processed (POST /payments/:id/process)
  │   └── Customer writes review (POST /reviews)
  │
  └── Rejected:
      └── Customer notified, can book another provider
```

### 6.4 Job Management Flow

```
Customer → POST /jobs (create job, status: open)
  │
  ├── Bull Queue Processor (auto-match):
  │   ├── Find providers: same category, nearby, available
  │   └── Create JobAssignment for each
  │
  ├── Provider → GET /jobs/available (see open jobs)
  │   Provider → POST /jobs/:id/assign (claim job)
  │   Provider → POST /jobs/:id/accept (confirm)
  │
  ├── Provider → PATCH /jobs/:id/status (in_progress → completed)
  │
  └── Job complete → payment, review
```

### 6.5 Payment Flow

```
Booking completed → payment required
  │
  Customer → POST /payments/:id/process
  │
  ├── PaymentGateway.authorize()
  │   ├── Success: status → authorized
  │   │   ├── PaymentGateway.capture()
  │   │   │   └── Status → paid
  │   │   └── Provider notified
  │   │
  │   └── Failure: status → failed
  │
  ├── Admin can refund:
  │   POST /payments/admin/:id/refund
  │   → Creates Refund record
  │   → Status: refunded / partially_refunded
  │
  └── Admin can cancel:
      PATCH /payments/admin/:id/status → cancelled
```

### 6.6 Notification Flow

```
Any business event (booking.created, message.sent, etc.)
  │
  EventEmitter fires event
  │
  NotificationService handles event:
  │
  ├── Check duplicate (same type + user, within 5min)
  │
  ├── Create in_app notification in DB
  │
  ├── If FCM configured:
  │   └── Send push notification via Firebase
  │
  └── If user connected via WebSocket:
      └── Emit via NotificationsGateway
```

### 6.7 Review Flow

```
Booking completed
  │
  Customer → POST /reviews (rating 1-5, comment)
  │
  ├── ProviderRatingStats recalculated
  ├── Provider notified
  │
  └── Moderation (optional):
      ├── Someone flags review
      ├── Admin reviews → approve or reject
      └── Flagged reviews hidden until moderation
```

### 6.8 AI Service Flow

```
User → POST /ai/chat (or other AI endpoint)
  │
  ├── Rate limit check (100 req/min/user)
  ├── File validation (for image uploads)
  │
  ├── Circuit breaker check:
  │   └── If 5 consecutive failures → block 30s
  │
  ├── HTTP POST to AI_SERVICE_URL
  │   ├── Retry: max 3 with exponential backoff
  │   └── Timeout: 30s
  │
  ├── Log request to AiRequestLog
  ├── Update AiHealthMonitor
  │
  └── Return AI response
```

### 6.9 Dispute Resolution Flow

```
Customer/Provider → POST /support/disputes
  │
  ├── Status: open
  ├── Upload evidence (optional)
  │
  └── Admin reviews:
      ├── PATCH /support/admin/disputes/:id/resolve
      ├── Resolution can include:
      │   ├── Full/partial refund
      │   ├── Booking adjustment
      │   └── Provider suspension
      └── Status: resolved / dismissed
```

---

## 7. Security Overview

### Authentication

| Mechanism      | Implementation                      |
|----------------|-------------------------------------|
| Password Hash  | bcrypt (salt rounds: 12)           |
| Access Token   | JWT (RS256 or HS256), 15min expiry |
| Refresh Token  | JWT, 7d expiry, stored in DB       |
| Token Revocation | Refresh tokens revoked on logout/password change |

### Authorization

| Guard              | Purpose                                |
|--------------------|----------------------------------------|
| `JwtAuthGuard`     | Validates JWT from Authorization header |
| `RolesGuard`       | Checks user role against required roles |
| `VerificationOwnerGuard` | Ensures resource ownership        |

### API Security

| Measure            | Configuration                         |
|--------------------|---------------------------------------|
| Rate Limiting      | @nestjs/throttler (configurable TTL + limit) |
| CORS               | Enabled in main.ts                    |
| Validation         | whitelist + forbidNonWhitelisted      |
| Global Prefix      | `/api/v1`                             |
| Helmet             | Not explicitly detected               |

### Data Validation

- class-validator decorators on all DTOs
- Global ValidationPipe with `transform: true`, `whitelist: true`, `forbidNonWhitelisted: true`
- Custom file validators for uploads (type, size)
- ParseUUIDPipe on all ID parameters

### Error Handling

- Global `AllExceptionsFilter` catches:
  - `HttpException` (all NestJS HTTP errors)
  - `Prisma.PrismaClientKnownRequestError`
  - `QueryFailedError` (TypeORM)
  - All unhandled exceptions → 500 Internal Server Error
- Structured error response with statusCode, message, error, timestamp, path

---

## 8. Environment Variables

| Variable                     | Description                              | Default         |
|------------------------------|------------------------------------------|-----------------|
| **Database**                 |                                          |                 |
| `DATABASE_URL`               | PostgreSQL connection string              | required        |
| `DB_HOST`                    | Database host                            | localhost       |
| `DB_PORT`                    | Database port                            | 5432            |
| `DB_USERNAME`                | Database username                        | postgres        |
| `DB_PASSWORD`                | Database password                        | required        |
| `DB_DATABASE`                | Database name                            | herfa           |

| **Redis**                    |                                          |                 |
| `REDIS_HOST`                 | Redis host                               | localhost       |
| `REDIS_PORT`                 | Redis port                               | 6379            |
| `REDIS_PASSWORD`             | Redis password                           | -               |

| **JWT**                      |                                          |                 |
| `JWT_SECRET`                 | JWT signing secret                       | required        |
| `JWT_EXPIRATION`             | Access token expiry                      | 15m             |
| `JWT_REFRESH_EXPIRATION`     | Refresh token expiry                     | 7d              |

| **AI Service**               |                                          |                 |
| `AI_SERVICE_URL`             | External AI service endpoint             | required        |
| `AI_API_KEY`                 | AI service API key                       | required        |
| `AI_TIMEOUT`                 | AI request timeout (ms)                  | 30000           |
| `AI_MAX_RETRIES`             | Max retries for AI requests              | 3               |
| `AI_RATE_LIMIT_TTL`          | Rate limit window (seconds)              | 60              |
| `AI_RATE_LIMIT_MAX`          | Max requests per window                  | 100             |
| `AI_CIRCUIT_BREAKER_THRESHOLD` | Failures before circuit opens         | 5               |
| `AI_CIRCUIT_BREAKER_TIMEOUT` | Circuit breaker reset timeout (ms)       | 30000           |

| **FCM (Push Notifications)** |                                          |                 |
| `FCM_SERVER_KEY`             | Firebase Cloud Messaging server key      | -               |
| `FCM_PROJECT_ID`             | Firebase project ID                      | -               |

| **Upload**                   |                                          |                 |
| `UPLOAD_DIR`                 | File upload directory                    | ./uploads       |
| `MAX_FILE_SIZE`              | Max upload file size (bytes)             | 5242880 (5MB)   |

| **Rate Limiting**            |                                          |                 |
| `THROTTLE_TTL`               | Rate limit window (seconds)              | 60              |
| `THROTTLE_LIMIT`             | Max requests per window                  | 100             |

| **Geo**                      |                                          |                 |
| `DEFAULT_SEARCH_RADIUS_KM`   | Default provider search radius           | 10              |

| **Jobs**                     |                                          |                 |
| `JOB_MATCHING_QUEUE`         | Bull queue name for job matching         | job-matching    |

| **Pagination**               |                                          |                 |
| `DEFAULT_PAGE_SIZE`          | Default items per page                   | 20              |
| `MAX_PAGE_SIZE`              | Maximum items per page                   | 100             |

| **Server**                   |                                          |                 |
| `PORT`                       | Server port                              | 3000            |
| `NODE_ENV`                   | Environment (development/production)     | development     |
| `CORS_ORIGIN`                | Allowed CORS origins                     | *               |

---

## 9. External Integrations

| Integration          | Purpose                                      | Status          |
|----------------------|----------------------------------------------|-----------------|
| PostgreSQL           | Primary database                             | ✅ Implemented  |
| Redis                | Caching, Bull queue backend, rate limiting   | ✅ Implemented  |
| Bull                 | Async job queue (job matching)               | ✅ Implemented  |
| Socket.io            | Real-time tracking + notifications           | ✅ Implemented  |
| Firebase Cloud Messaging | Push notifications                      | ✅ Configured   |
| OpenAI-compatible AI | AI chat, classification, OCR, recommendations| ✅ Implemented  |
| JWT (Passport)       | Authentication                               | ✅ Implemented  |
| Swagger              | API documentation UI                         | ✅ Implemented  |

**Planned but not implemented**:
- Cloud storage (S3/Cloudinary) - `StorageProvider` interface exists as abstraction
- Payment gateway (Stripe/PayPal) - `PaymentGatewayProvider` interface exists
- SMS provider for notifications

---

## 10. Swagger Gap Analysis

| Aspect                    | Status                  | Notes                                      |
|---------------------------|-------------------------|--------------------------------------------|
| Swagger UI Setup          | ✅ Present              | `/api/docs` with BearerAuth scheme         |
| API Tags                  | ✅ Present              | Per-module tags used                       |
| DTO Decorators            | ⚠️ Partial             | Missing on some nested DTOs                |
| Response Types            | ⚠️ Partial             | Some endpoints missing @ApiResponse        |
| Auth Decorator            | ✅ @ApiBearerAuth()     | Applied on all protected controllers       |
| Query Parameter Docs      | ⚠️ Partial             | Some endpoints missing @ApiQuery           |
| Enum Values               | ✅ Documented           | Swagger enums for status, roles, etc.      |
| Pagination Meta           | ⚠️ Not explicit        | Pagination response not typed in swagger   |
| File Upload Docs          | ⚠️ Basic               | @ApiConsumes('multipart/form-data') needed |

**Gaps to fill**:
1. Add `@ApiResponse` to every endpoint with proper types
2. Add `@ApiBody` where request body types may be ambiguous
3. Add `@ApiQuery` for all filter/pagination parameters
4. Document pagination response type with OpenAPI schema
5. Add `@ApiConsumes` + `@ApiBody` for file upload endpoints
6. Add `@ApiProperty` descriptions on all DTO fields (many missing)
7. Add `@ApiTags` for admin controller variants

---

## 11. API Dependency Map

```
Authentication
  ├── Users Module (current user profile)
  ├── Providers Module (profile, services, availability)
  │   ├── Categories Module (service categories)
  │   └── Provider Verification Module
  │       └── Uploads Module (document uploads)
  ├── Customers Module
  ├── Service Listings Module
  │   ├── Categories Module
  │   └── Uploads Module (images)
  ├── Bookings Module
  │   ├── Service Listings Module (validate service)
  │   ├── Payments Module (process payment)
  │   ├── Reviews Module (leave review on completion)
  │   └── Tracking Module (real-time tracking)
  ├── Jobs Module
  │   ├── Categories Module (category matching)
  │   └── Bull Queue (auto-matching)
  ├── Payments Module
  │   └── Refunds Module
  ├── Reviews Module
  ├── Messages Module
  ├── Tenders Module
  ├── Notifications Module
  │   └── FCM (push)
  ├── Support Module
  │   └── Uploads Module (ticket attachments, evidence)
  ├── AI Gateway Module
  │   └── Uploads Module (image analysis, OCR)
  ├── Analytics Module
  ├── Admin Module (aggregates across all modules)
  └── Addresses Module
```

---

## 12. Backend Architecture

### Module Organization

```
src/
├── main.ts                           # Bootstrap, Swagger, CORS, Validation
├── app.module.ts                     # Root module (imports all feature modules)
├── config/
│   ├── data-source.ts                # TypeORM DataSource configuration
│   └── env.validation.ts             # Environment variable validation
│
├── common/
│   ├── constants/                    # Enums (User, Notification, Payment, etc.)
│   ├── decorators/                   # @CurrentUser, @Roles
│   ├── dto/                          # PaginationDto, ProviderSearchDto
│   ├── filters/                      # AllExceptionsFilter (global)
│   ├── guards/                       # JwtAuthGuard, RolesGuard, VerificationGuard
│   ├── interceptors/                 # TransformInterceptor (response wrapper)
│   └── interfaces/                   # PaymentGatewayProvider, StorageProvider
│
├── entities/                         # 29 TypeORM entity files
│   ├── user.entity.ts
│   ├── booking.entity.ts
│   ├── provider-profile.entity.ts
│   └── ...
│
├── modules/
│   ├── auth/                         # AuthController, AuthService, JwtStrategy
│   ├── users/                        # UsersController, UsersService
│   ├── providers/                    # ProvidersController, AdminProvidersController
│   ├── customers/                    # CustomersController
│   ├── categories/                   # CategoriesController
│   ├── services/                     # ServiceListingsController
│   ├── bookings/                     # BookingsController
│   ├── jobs/                         # JobsController, JobMatchingProcessor
│   ├── payments/                     # PaymentsController
│   ├── refunds/                      # RefundsService
│   ├── reviews/                      # ReviewsController
│   ├── notifications/                # NotificationsController, FCM Service
│   ├── support/                      # SupportTicketsController, DisputesController
│   ├── tenders/                      # TendersController
│   ├── messages/                     # MessagesController
│   ├── tracking/                     # TrackingController, TrackingGateway
│   ├── admin/                        # AdminController
│   ├── analytics/                    # AnalyticsController, AnalyticsService
│   ├── ai-gateway/                   # AiGatewayController, AiClientService
│   ├── uploads/                      # UploadsController
│   ├── verification/                 # VerificationController
│   ├── provider-verification/        # ProviderVerificationController + Admin
│   ├── addresses/                    # AddressesController
│   └── prisma/                       # PrismaService
│
└── schema.prisma                     # Prisma schema (subset of models)
```

### Data Flow Pattern

```
Client → Controller → Guard(s) → Decorator(s) → Service → Repository/TypeORM → Database
                          │                            │
                          │                            └── External APIs (AI, FCM)
                          │
                     ValidationPipe (DTO)
```

### Event Flow Pattern

```
Service → EventEmitter.emit(event)
              │
        Event Handler (Listener)
              │
              ├── NotificationService (in-app + push)
              ├── AuditService (write audit log)
              └── Bull Queue (async processing)
```

### Key Design Patterns

1. **Repository Pattern**: TypeORM repositories injected into services
2. **Dependency Injection**: NestJS DI for all services, guards, controllers
3. **Strategy Pattern**: `PaymentGatewayProvider` interface for payment providers
4. **Observer Pattern**: EventEmitter for cross-module communication
5. **Circuit Breaker**: AI Gateway for external service resilience
6. **Queue Pattern**: Bull for async job matching and background processing
7. **Guard Pattern**: NestJS guards for auth + role + ownership checks
8. **Interceptor Pattern**: TransformInterceptor wraps all responses in `{ data, timestamp }`
9. **Filter Pattern**: AllExceptionsFilter for global error handling
10. **Module Pattern**: Feature modules encapsulate related controllers, services, entities

---

> **Document generated**: 2026-06-10  
> **Codebase version**: Herfa Backend (NestJS 10.3 / TypeScript)  
> **Generated by**: AI Code Analysis
