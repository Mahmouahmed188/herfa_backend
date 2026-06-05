# Data Model: Real-Time Tracking System

## Entity: TrackingSession

Represents a real-time tracking session linked to a single booking.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID (PK) | Auto | uuid_generate_v4() | Primary key |
| bookingId | UUID (FK) | Yes | — | References Booking.id. Unique constraint (one session per booking). |
| providerId | UUID (FK) | Yes | — | References User.id (provider role) |
| customerId | UUID (FK) | Yes | — | References User.id (customer role) |
| status | Enum | Yes | 'inactive' | One of: inactive, active, paused, completed |
| startedAt | Timestamp | No | null | When tracking was activated (first location update) |
| endedAt | Timestamp | No | null | When tracking was completed or terminated |
| createdAt | Timestamp | Auto | now() | Record creation timestamp |
| updatedAt | Timestamp | Auto | now() | Last update timestamp |

### Indexes

| Column(s) | Type | Purpose |
|-----------|------|---------|
| bookingId | UNIQUE | Enforce one session per booking |
| providerId | BTREE | Filter sessions by provider |
| customerId | BTREE | Filter sessions by customer |
| status | BTREE | Filter by status |
| (providerId, status) | COMPOSITE | Active session lookup by provider |
| (customerId, status) | COMPOSITE | Active session lookup by customer |
| createdAt | BTREE | Sort/filter by creation date |

### Constraints

- `bookingId` has a UNIQUE constraint to prevent multiple active sessions for the same booking
- `bookingId` references `Booking.id` with CASCADE delete
- `providerId` references `User.id` with RESTRICT delete
- `customerId` references `User.id` with RESTRICT delete

### State Transitions

```
inactive ──[start]──▶ active ──[pause]──▶ paused ──[resume]──▶ active
                         │                                      │
                         ├──[booking_completed]──────────────▶ completed
                         ├──[booking_cancelled]──────────────▶ completed
                         └──[complete]───────────────────────▶ completed
paused ──[booking_completed]──▶ completed
paused ──[booking_cancelled]──▶ completed
```

**Transition Rules:**
- `inactive → active`: Only when booking status is accepted, on_the_way, or in_progress
- `active → paused`: Provider-initiated pause
- `paused → active`: Provider-initiated resume
- `* → completed`: Booking completed or cancelled (auto or manual)
- No other transitions are valid

---

## Entity: TrackingLocation

Represents an individual location point recorded during a tracking session. Append-only, immutable.

### Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| id | UUID (PK) | Auto | uuid_generate_v4() | Primary key |
| trackingSessionId | UUID (FK) | Yes | — | References TrackingSession.id |
| latitude | Decimal(10,8) | Yes | — | WGS84 latitude (-90 to 90) |
| longitude | Decimal(11,8) | Yes | — | WGS84 longitude (-180 to 180) |
| speed | Decimal | No | null | Speed in meters/second |
| heading | Integer | No | null | Direction in degrees (0-360, 0 = North) |
| recordedAt | Timestamp | Yes | Auto | When the location was recorded by the provider's device |

### Indexes

| Column(s) | Type | Purpose |
|-----------|------|---------|
| (trackingSessionId, recordedAt DESC) | COMPOSITE | Efficient latest-location lookup + chronological listing |
| trackingSessionId | BTREE | History queries by session |
| recordedAt | BTREE | Time-based queries and pruning |

### Constraints

- `trackingSessionId` references `TrackingSession.id` with CASCADE delete
- `latitude` must be between -90 and 90
- `longitude` must be between -180 and 180
- `speed` must be >= 0 when provided
- `heading` must be between 0 and 360 when provided
- Records are immutable — no UPDATE or DELETE allowed after creation

---

## Entity: Location Update (Transient / Message)

Not a stored entity; represents the incoming payload from provider client.

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| latitude | number | Yes | -90 to 90 |
| longitude | number | Yes | -180 to 180 |
| speed | number | No | >= 0 |
| heading | number | No | 0 to 360 |
| timestamp | ISO 8601 | No | If omitted, server uses current time |

---

## Relationships

```
Booking (1) ───────────▶ (1) TrackingSession
                              │
                              │ (1)
                              │
                              ▼ (many)
                        TrackingLocation

User (Provider) (1) ───▶ (many) TrackingSession
User (Customer) (1) ───▶ (many) TrackingSession
```

### Foreign Key Summary

| Source | Target | Type | On Delete |
|--------|--------|------|-----------|
| TrackingSession.bookingId | Booking.id | Many-to-One | CASCADE |
| TrackingSession.providerId | User.id | Many-to-One | RESTRICT |
| TrackingSession.customerId | User.id | Many-to-One | RESTRICT |
| TrackingLocation.trackingSessionId | TrackingSession.id | Many-to-One | CASCADE |

---

## Route Information (RouteInfo)

Stored as JSON column on TrackingSession for future extensibility.

| Field | Type | Description |
|-------|------|-------------|
| currentLatitude | Decimal | Latest provider latitude (denormalized for quick access) |
| currentLongitude | Decimal | Latest provider longitude (denormalized for quick access) |
| destinationLatitude | Decimal | Booking's service address latitude |
| destinationLongitude | Decimal | Booking's service address longitude |
| distanceRemaining | Decimal | Estimated distance in meters (placeholder, calculated by future map provider) |
| estimatedArrivalAt | Timestamp | Estimated arrival time (placeholder, calculated by future map provider) |

These fields may be stored directly on TrackingSession or in a separate JSON/metadata column.

---

## Validation Rules (Summary)

| Rule | Applies To | Description |
|------|-----------|-------------|
| Latitude range | TrackingLocation.latitude | -90 to 90 |
| Longitude range | TrackingLocation.longitude | -180 to 180 |
| Speed range | TrackingLocation.speed | >= 0 |
| Heading range | TrackingLocation.heading | 0 to 360 |
| Booking status | Session start | Must be accepted, on_the_way, or in_progress |
| Session status | Location update | Must be active |
| Unique active | Booking | Only one active session per booking |
| Ownership | Session | Provider owns, Customer owns booking |
| Immutability | Location history | No updates or deletes |
