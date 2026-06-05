# Research: Real-Time Tracking System

**Created**: 2026-06-05

## Overview

Consolidation of architectural decisions for the Real-Time Tracking feature, derived from existing project patterns and codebase conventions.

## Decisions

### Decision 1: ORM Approach

**Decision**: Dual ORM — TypeORM for entity definitions and runtime queries; Prisma for schema definition and migration generation.

**Rationale**: The project already uses both TypeORM (primary runtime ORM with `@nestjs/typeorm`) and Prisma (schema definition in `prisma/schema.prisma`, migration generation via `prisma migrate`). All existing modules define TypeORM entities in `src/entities/` and mirror them in `prisma/schema.prisma`. The tracking feature must follow this pattern to maintain consistency and ensure Prisma-generated types are available.

**Alternatives considered**: TypeORM-only (would break Prisma schema completeness); Prisma-only (would break existing TypeORM pattern and require rewriting all repository code).

---

### Decision 2: Real-Time Communication

**Decision**: Extend the existing WebSocket infrastructure using `@nestjs/websockets` with Socket.IO.

**Rationale**: The project already has a `TrackingGateway` and `NotificationsGateway` using Socket.IO at namespaces `/tracking` and `/notifications` respectively. These gateways handle JWT-based connection authentication, room management (`user:{userId}`, `job:{jobId}`), and event emission. The tracking feature will add location broadcast events to the existing gateway rather than creating a new one.

**Alternatives considered**: Server-Sent Events (would require separate infrastructure and not match existing pattern); raw WebSocket (Socket.IO already in use); new dedicated gateway (unnecessary — existing gateway can be extended).

---

### Decision 3: Event-Driven Notification Integration

**Decision**: Use `@nestjs/event-emitter` for tracking lifecycle events, consumed by existing notification handlers.

**Rationale**: The project extensively uses `EventEmitter2` for cross-module communication. Booking lifecycle emits events like `booking.accepted`, `booking.completed` which are consumed by notification handlers in the Notifications module. Tracking events (`tracking.started`, `tracking.paused`, `tracking.completed`, `tracking.arrived_nearby`, `tracking.arrived`) will follow the same pattern.

**Alternatives considered**: Direct service calls (creates tight coupling); message queue (overkill for in-process events); WebSocket-only (notifications module already uses event-emitter).

---

### Decision 4: Location Storage Strategy

**Decision**: Store all location updates in a `tracking_locations` table append-only. Latest location retrieved via `ORDER BY recordedAt DESC LIMIT 1` indexed query.

**Rationale**: The spec requires immutable history for audit. Append-only storage satisfies immutability. Index on `(trackingSessionId, recordedAt DESC)` ensures fast latest-location lookups. Batched inserts handle high-frequency updates.

**Alternatives considered**: In-memory cache + periodic flush (risk of data loss); separate latest-location table (duplication, sync complexity); document store (additional infrastructure).

---

### Decision 5: Provider/Customer/Admin Controller Separation

**Decision**: Three controller classes within the `tracking` module following the existing Bookings module pattern.

**Rationale**: The existing `bookings` module separates concerns into `BookingsController` (customer), `ProviderBookingsController` (provider), and `AdminBookingsController` (admin). This pattern keeps routes organized by role, simplifies guard application, and is familiar to developers.

**Alternatives considered**: Single controller with role-based method guards (would become cluttered); separate modules per role (overkill); gateway-only approach (REST endpoints still needed for history/status queries).
