# API Contracts: Real-Time Tracking System

Base URL: `/api/v1`

Authentication: Bearer JWT token in `Authorization` header.

---

## Provider Endpoints

### POST /tracking/start

Start a tracking session for an active booking.

**Auth**: Provider role

**Request Body**:
```json
{
  "bookingId": "uuid"
}
```

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "bookingId": "uuid",
    "status": "active",
    "startedAt": "2026-06-05T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `400` — Booking not found, invalid status, or active session already exists
- `403` — Booking does not belong to this provider

---

### PATCH /tracking/location

Send a location update for the provider's active tracking session.

**Auth**: Provider role

**Request Body**:
```json
{
  "latitude": 30.0444,
  "longitude": 31.2357,
  "speed": 12.5,
  "heading": 45
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "recordedAt": "2026-06-05T10:05:00.000Z"
  }
}
```

**Error Responses**:
- `400` — Invalid coordinates (latitude -90..90, longitude -180..180)
- `403` — No active session for this provider

---

### PATCH /tracking/pause

Pause an active tracking session.

**Auth**: Provider role

**Request Body**: (none)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "previousStatus": "active",
    "newStatus": "paused",
    "timestamp": "2026-06-05T10:10:00.000Z"
  }
}
```

**Error Responses**:
- `400` — Session not in active status

---

### PATCH /tracking/resume

Resume a paused tracking session.

**Auth**: Provider role

**Request Body**: (none)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "previousStatus": "paused",
    "newStatus": "active",
    "timestamp": "2026-06-05T10:15:00.000Z"
  }
}
```

---

### PATCH /tracking/complete

Manually complete a tracking session (when booking is completed).

**Auth**: Provider role

**Request Body**: (none)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "status": "completed",
    "endedAt": "2026-06-05T11:00:00.000Z"
  }
}
```

---

## Customer Endpoints

### GET /tracking/:bookingId

Get current tracking status for a booking.

**Auth**: Customer role

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "bookingId": "uuid",
    "providerId": "uuid",
    "status": "active",
    "currentLocation": {
      "latitude": 30.0444,
      "longitude": 31.2357,
      "updatedAt": "2026-06-05T10:05:00.000Z"
    },
    "route": {
      "distanceRemaining": 2500,
      "estimatedArrivalAt": "2026-06-05T10:30:00.000Z"
    },
    "startedAt": "2026-06-05T10:00:00.000Z"
  }
}
```

**Error Responses**:
- `403` — Customer does not own this booking
- `404` — No tracking session for this booking

---

### GET /tracking/:bookingId/history

Get immutable location history for a completed booking's tracking session.

**Auth**: Customer role

**Query Parameters**:
- `page` (integer, default: 1)
- `limit` (integer, default: 50, max: 200)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "latitude": 30.0444,
        "longitude": 31.2357,
        "speed": 12.5,
        "heading": 45,
        "recordedAt": "2026-06-05T10:05:00.000Z"
      }
    ],
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  }
}
```

---

## Admin Endpoints

### GET /admin/tracking

Get paginated list of all tracking sessions.

**Auth**: Admin role

**Query Parameters**:
- `status` (string, optional — filter: inactive, active, paused, completed)
- `bookingId` (UUID, optional)
- `providerId` (UUID, optional)
- `customerId` (UUID, optional)
- `dateFrom` (ISO 8601, optional)
- `dateTo` (ISO 8601, optional)
- `page` (integer, default: 1)
- `limit` (integer, default: 20)
- `sortBy` (string, default: createdAt)
- `sortOrder` (asc | desc, default: desc)

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "bookingId": "uuid",
        "providerId": "uuid",
        "customerId": "uuid",
        "status": "active",
        "startedAt": "2026-06-05T10:00:00.000Z",
        "endedAt": null,
        "createdAt": "2026-06-05T10:00:00.000Z"
      }
    ],
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

### GET /admin/tracking/:id

Get full details of a specific tracking session, including all location history.

**Auth**: Admin role

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "session": {
      "id": "uuid",
      "bookingId": "uuid",
      "providerId": "uuid",
      "customerId": "uuid",
      "status": "completed",
      "startedAt": "2026-06-05T10:00:00.000Z",
      "endedAt": "2026-06-05T11:00:00.000Z",
      "createdAt": "2026-06-05T10:00:00.000Z",
      "updatedAt": "2026-06-05T11:00:00.000Z"
    },
    "locations": {
      "items": [
        {
          "id": "uuid",
          "latitude": 30.0444,
          "longitude": 31.2357,
          "speed": 12.5,
          "heading": 45,
          "recordedAt": "2026-06-05T10:05:00.000Z"
        }
      ],
      "total": 150,
      "page": 1,
      "limit": 50,
      "totalPages": 3
    }
  }
}
```

---

## Error Response Format

All errors follow the standard Herfa format:

```json
{
  "success": false,
  "message": "Human-readable error description",
  "errorCode": "TRACKING_003",
  "timestamp": "2026-06-05T10:00:00.000Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| TRACKING_001 | 400 | Invalid coordinates (lat/lng out of range) |
| TRACKING_002 | 400 | Booking status does not allow tracking |
| TRACKING_003 | 400 | Active tracking session already exists for this booking |
| TRACKING_004 | 400 | Cannot pause — session is not active |
| TRACKING_005 | 400 | Cannot resume — session is not paused |
| TRACKING_006 | 400 | Cannot update — session is not active |
| TRACKING_007 | 403 | Booking does not belong to this provider |
| TRACKING_008 | 403 | Customer does not own this booking |
| TRACKING_009 | 404 | Tracking session not found |
| TRACKING_010 | 404 | Booking not found |

---

## WebSocket Events

Namespace: `/tracking` (existing `TrackingGateway`)

### Client to Server

| Event | Payload | Description |
|-------|---------|-------------|
| `updateLocation` | `{ latitude, longitude, speed?, heading?, bookingId }` | Send location update (provider only) |
| `joinJob` | `{ jobId }` | Join job room for real-time updates |
| `leaveJob` | `{ jobId }` | Leave job room |

### Server to Client

| Event | Payload | Description |
|-------|---------|-------------|
| `providerLocation` | `{ providerId, latitude, longitude, speed?, heading?, timestamp }` | Broadcast location update to customers in job room |
| `trackingStatusChanged` | `{ sessionId, status, timestamp }` | Tracking session status change (started, paused, resumed, completed) |

---

## Event Emitter Events (Internal)

Events emitted via `@nestjs/event-emitter` for cross-module communication:

| Event | Payload | Consumer |
|-------|---------|----------|
| `tracking.started` | `{ sessionId, bookingId, providerId, customerId }` | Notifications module |
| `tracking.paused` | `{ sessionId, bookingId, providerId, customerId }` | Notifications module |
| `tracking.resumed` | `{ sessionId, bookingId, providerId, customerId }` | Notifications module |
| `tracking.completed` | `{ sessionId, bookingId, providerId, customerId }` | Notifications module |
| `tracking.arrived_nearby` | `{ sessionId, bookingId, providerId, customerId }` | Notifications module |
| `tracking.arrived` | `{ sessionId, bookingId, providerId, customerId }` | Notifications module |
