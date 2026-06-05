# Quickstart: Real-Time Tracking System

## Implementation Order

Follow this order for production-ready implementation:

### Step 1: Database Schema

**Prisma Schema** — Add to `prisma/schema.prisma`:

```prisma
enum tracking_session_status_enum {
  inactive
  active
  paused
  completed
}

model TrackingSession {
  id            String                          @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  bookingId     String                          @unique @db.Uuid
  providerId    String                          @db.Uuid
  customerId    String                          @db.Uuid
  status        tracking_session_status_enum    @default(inactive)
  startedAt     DateTime?                       @db.Timestamp(6)
  endedAt       DateTime?                       @db.Timestamp(6)
  createdAt     DateTime                        @default(now()) @db.Timestamp(6)
  updatedAt     DateTime                        @default(now()) @db.Timestamp(6)
  booking       Booking                         @relation(fields: [bookingId], references: [id], onDelete: Cascade)
  locations     TrackingLocation[]
  auditEvents   TrackingAuditEvent[]

  @@index([providerId], map: "idx_tracking_session_provider")
  @@index([customerId], map: "idx_tracking_session_customer")
  @@index([status], map: "idx_tracking_session_status")
  @@index([providerId, status], map: "idx_tracking_session_provider_status")
  @@index([customerId, status], map: "idx_tracking_session_customer_status")
  @@index([createdAt], map: "idx_tracking_session_created")
  @@map("tracking_sessions")
}

model TrackingLocation {
  id                String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  trackingSessionId String   @db.Uuid
  latitude          Decimal  @db.Decimal(10, 8)
  longitude         Decimal  @db.Decimal(11, 8)
  speed             Decimal? @db.Decimal(6, 2)
  heading           Int?
  recordedAt        DateTime @db.Timestamp(6)
  trackingSession   TrackingSession @relation(fields: [trackingSessionId], references: [id], onDelete: Cascade)

  @@index([trackingSessionId, recordedAt], map: "idx_tracking_location_session_time")
  @@index([trackingSessionId], map: "idx_tracking_location_session")
  @@index([recordedAt], map: "idx_tracking_location_recorded")
  @@map("tracking_locations")
}

model TrackingAuditEvent {
  id                String   @id @default(dbgenerated("uuid_generate_v4()")) @db.Uuid
  trackingSessionId String   @db.Uuid
  eventType         String   @db.VarChar(30)
  previousStatus    String?  @db.VarChar(20)
  newStatus         String   @db.VarChar(20)
  metadata          Json?    @db.Json
  createdAt         DateTime @default(now()) @db.Timestamp(6)
  trackingSession   TrackingSession @relation(fields: [trackingSessionId], references: [id], onDelete: Cascade)

  @@index([trackingSessionId], map: "idx_audit_tracking_session")
  @@index([createdAt], map: "idx_audit_tracking_created")
  @@map("tracking_audit_events")
}
```

Then run `npx prisma migrate dev --name add-tracking-sessions` to generate migration.

### Step 2: TypeORM Entities

Create `src/entities/tracking-session.entity.ts` and `src/entities/tracking-location.entity.ts` following the existing entity pattern (see `provider-location.entity.ts` for reference).

### Step 3: DTOs

Create DTOs in `src/modules/tracking/dto/`:
- `start-tracking.dto.ts` — `@IsUUID()` bookingId
- `location-update.dto.ts` — `@IsNumber()` latitude/longitude with min/max decorators, optional speed/heading
- `tracking-session.dto.ts` — Response DTO with `@ApiProperty()`
- `tracking-filter.dto.ts` — Extend `PaginationDto` with status/date filters
- `pause-resume.dto.ts` — Status change response

### Step 4: Module + Guards

Update `tracking.module.ts` to import `TypeOrmModule.forFeature([TrackingSession, TrackingLocation])` and register new controllers/services. Add `tracking-ownership.guard.ts`.

### Step 5: Service

Implement `TrackingService` with:
- `startSession(bookingId, providerId)`
- `updateLocation(sessionId, locationDto)`
- `pauseSession(sessionId)`
- `resumeSession(sessionId)`
- `completeSession(sessionId)`
- `getSession(bookingId, customerId)`
- `getHistory(sessionId, pagination)`
- `getAdminSessions(filterDto)`
- `getAdminSessionDetail(id)`

### Step 6: Controllers

Create three controller classes following the Bookings module pattern:
- `TrackingController` (customer) — `GET /tracking/:bookingId`, `GET /tracking/:bookingId/history`
- `ProviderTrackingController` (provider) — `POST /tracking/start`, `PATCH /tracking/location`, `PATCH /tracking/pause`, `PATCH /tracking/resume`, `PATCH /tracking/complete`
- `AdminTrackingController` (admin) — `GET /admin/tracking`, `GET /admin/tracking/:id`

### Step 7: Guards

- `TrackingOwnershipGuard` — Verify provider owns session (for provider endpoints) or customer owns booking (for customer endpoints)

### Step 8: Event Integration

Emit events from `TrackingService` on lifecycle changes. Wire up notifications in the existing `NotificationsModule` handlers to consume `tracking.*` events.

### Step 9: WebSocket Enhancement

Enhance `TrackingGateway` to:
- Emit `providerLocation` to `job:{bookingId}` room on location update
- Emit `trackingStatusChanged` to `user:{customerId}` on status changes
- Add `@SubscribeMessage('joinBooking')` for customers to join booking-specific rooms

### Step 10: Tests

Write `*.spec.ts` files for service and controllers. Mock TypeORM repositories and event emitter.

---

## Files to Create

```
src/entities/tracking-session.entity.ts        (NEW)
src/entities/tracking-location.entity.ts        (NEW)
src/modules/tracking/dto/start-tracking.dto.ts  (NEW)
src/modules/tracking/dto/location-update.dto.ts (NEW)
src/modules/tracking/dto/tracking-session.dto.ts (NEW)
src/modules/tracking/dto/tracking-filter.dto.ts (NEW)
src/modules/tracking/dto/pause-resume.dto.ts    (NEW)
src/modules/tracking/guards/tracking-ownership.guard.ts (NEW)
src/modules/tracking/tracking.service.ts        (NEW)
src/modules/tracking/tracking.service.spec.ts   (NEW)
src/modules/tracking/tracking.controller.ts     (NEW)
src/modules/tracking/provider-tracking.controller.ts (NEW)
src/modules/tracking/admin-tracking.controller.ts    (NEW)
src/modules/tracking/tracking.controller.spec.ts     (NEW)
src/modules/tracking/provider-tracking.controller.spec.ts (NEW)
```

## Files to Modify

```
prisma/schema.prisma                          (ADD models + enum)
src/modules/tracking/tracking.module.ts       (ADD imports, providers, controllers)
src/modules/tracking/tracking.gateway.ts      (ENHANCE with booking rooms)
src/app.module.ts                             (ADD TrackingModule if not already imported)
```
