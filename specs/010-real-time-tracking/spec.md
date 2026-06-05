# Feature Specification: Real-Time Tracking System

**Feature Branch**: `010-real-time-tracking`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Design and implement the Real-Time Tracking System for the Herfa Backend. This module enables real-time provider location tracking during active bookings and allows customers to monitor provider progress toward the service location..."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Provider shares live location during active booking (Priority: P1)

A provider who has accepted a booking navigates to the service location and shares their live location so the customer can track their progress.

**Why this priority**: Live location sharing is the core value of the tracking system. Without it, customers cannot monitor provider arrival and the feature has no purpose.

**Independent Test**: A provider with an accepted booking can start a tracking session, send location updates, and verify that the session transitions through active, pause, and complete states. This can be tested end-to-end with a single provider account and a booking.

**Acceptance Scenarios**:

1. **Given** a provider with a booking in "accepted" status, **When** they start a tracking session, **Then** the system creates an active tracking session linked to the booking and notifies the customer that the provider has started their route.
2. **Given** an active tracking session, **When** the provider sends a location update with valid coordinates, **Then** the system stores the location and makes it available to the customer.
3. **Given** an active tracking session, **When** the provider pauses location sharing, **Then** the session status changes to "paused" and the customer is notified.
4. **Given** a paused tracking session, **When** the provider resumes location sharing, **Then** the session status changes back to "active" and the customer is notified.
5. **Given** an active tracking session, **When** the booking is completed, **Then** the session status changes to "completed" and no further location updates are accepted.

---

### User Story 2 - Customer views provider's live location (Priority: P1)

A customer who has an active booking with an accepted provider wants to see the provider's current location, estimated distance, and arrival time.

**Why this priority**: Customer visibility into provider location is the primary user-facing feature. Without this, customers have no way to track their service provider.

**Independent Test**: A customer with an active booking where the provider has started tracking can view the provider's current location, see it update when the provider sends new coordinates, and view the estimated distance and arrival time. This can be tested with a customer account linked to a booking with an active tracking session.

**Acceptance Scenarios**:

1. **Given** a customer with a booking that has an active tracking session, **When** they request the current tracking status, **Then** they see the provider's latest location (latitude and longitude), estimated distance remaining, and estimated arrival time.
2. **Given** a customer viewing tracking information, **When** the provider sends a new location update, **Then** the customer sees the updated location within a reasonable timeframe.
3. **Given** a customer with an active booking, **When** they attempt to view tracking for a booking that does not belong to them, **Then** the system denies access.
4. **Given** a customer with a completed booking, **When** they request live tracking, **Then** the system responds that tracking has ended and provides access to the tracking history instead.

---

### User Story 3 - Admin monitors all active tracking sessions (Priority: P2)

An admin wants to oversee all active tracking sessions across the platform to monitor provider activity and investigate any issues.

**Why this priority**: Admin oversight is important for platform governance but is secondary to the core provider-customer tracking flow.

**Independent Test**: An admin can view a paginated list of all tracking sessions, filter by status and date range, and view detailed information for any specific session including its location history.

**Acceptance Scenarios**:

1. **Given** an admin user, **When** they request the list of all tracking sessions, **Then** they see a paginated, sorted list with session status, provider name, customer name, booking ID, start time, and end time.
2. **Given** an admin viewing the tracking list, **When** they filter by status "active", **Then** only active sessions are displayed.
3. **Given** an admin, **When** they select a specific tracking session, **Then** they see full details including all location updates in chronological order.
4. **Given** a non-admin user, **When** they attempt to access admin tracking endpoints, **Then** the system denies access.

---

### User Story 4 - Customer views tracking history (Priority: P3)

A customer wants to review the tracking history of a completed booking for reference or dispute resolution.

**Why this priority**: History access is valuable for post-service transparency and trust, but is not critical to the core real-time tracking functionality.

**Independent Test**: A customer can view an immutable chronological log of all location updates from a completed booking's tracking session.

**Acceptance Scenarios**:

1. **Given** a customer with a completed booking, **When** they request the tracking history, **Then** they see a chronological list of all location updates with timestamps that cannot be modified.
2. **Given** a customer, **When** they request history for a booking they do not own, **Then** the system denies access.

---

### Edge Cases

- What happens when a provider tries to start tracking for a booking that is not in "accepted", "on_the_way", or "in_progress" status? The system should reject the request with a clear error.
- What happens when a provider tries to send a location update after the tracking session is completed? The system should reject the update.
- What happens when a provider tries to start a second tracking session for a booking that already has an active session? The system should reject the request.
- What happens when a customer tries to track a booking that has no tracking session? The system should return a clear response indicating tracking is not yet available.
- What happens when location data contains invalid coordinates (latitude outside -90 to 90, longitude outside -180 to 180)? The system should reject the update with a validation error.
- What happens when a provider's network connection is lost during location updates? The system should accept updates once connectivity resumes; stale or out-of-order updates may be discarded.
- What happens when a booking is cancelled while tracking is active? The session should be automatically terminated and no further updates accepted.
- What happens when multiple location updates arrive near-simultaneously? The system should process and store each update in order based on the recorded timestamp.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a provider to start a tracking session only when their associated booking is in "accepted", "on_the_way", or "in_progress" status.
- **FR-002**: System MUST enforce that each booking can have at most one active tracking session at any given time.
- **FR-003**: System MUST allow a provider to send location updates only when the tracking session status is "active".
- **FR-004**: System MUST validate that each location update contains a latitude in the range -90 to 90 and a longitude in the range -180 to 180.
- **FR-005**: System MUST store each location update with latitude, longitude, timestamp, and optional speed and heading values.
- **FR-006**: System MUST allow a provider to pause an active tracking session, changing status to "paused".
- **FR-007**: System MUST allow a provider to resume a paused tracking session, restoring status to "active".
- **FR-008**: System MUST automatically set a tracking session to "completed" when the associated booking is completed.
- **FR-009**: System MUST automatically terminate a tracking session when the associated booking is cancelled.
- **FR-010**: System MUST allow a customer to view the current tracking status and latest location for bookings they own.
- **FR-011**: System MUST allow a customer to view the full location history for their completed bookings.
- **FR-012**: System MUST allow an admin to view all tracking sessions across the platform.
- **FR-013**: System MUST allow an admin to view the full location history of any tracking session.
- **FR-014**: System MUST support pagination and sorting of tracking sessions for both customer and admin views.
- **FR-015**: System MUST support filtering tracking sessions by status, booking ID, provider, customer, and date range.
- **FR-016**: System MUST restrict a provider to only manage their own tracking sessions.
- **FR-017**: System MUST restrict a customer to only view tracking sessions for their own bookings.
- **FR-018**: System MUST trigger a notification event when a provider starts their route.
- **FR-019**: System MUST trigger a notification event when a provider is near the service location.
- **FR-020**: System MUST trigger a notification event when a provider arrives at the service location.
- **FR-021**: System MUST trigger notification events when tracking is paused or completed.
- **FR-022**: System MUST maintain an immutable history of all location updates that cannot be modified or deleted.
- **FR-023**: System MUST maintain an immutable audit trail of tracking session lifecycle events (creation, activation, pause, resume, completion, termination).
- **FR-024**: System MUST store route information including current location, destination location, distance remaining, and estimated arrival time.

### Key Entities *(include if feature involves data)*

- **Tracking Session**: Represents a real-time tracking session linked to a single booking. Each session has a status (inactive, active, paused, completed), tracks who (provider, customer) is involved, and records when tracking started and ended. Has a one-to-one relationship with Booking.
- **Tracking Location**: An individual location point recorded during a tracking session. Each location contains latitude, longitude, an optional speed, an optional heading, and a recorded timestamp. Belongs to exactly one Tracking Session. Locations are immutable once recorded.
- **Route Information**: The current route state for a tracking session including current location, destination, estimated distance remaining, and estimated arrival time. Actual route calculation is deferred to future external map provider integration.
- **Booking (external entity)**: The booking that the tracking session is associated with. Provides the context for tracking (who, what, where). Already exists as part of the Booking Management module.
- **Provider (external entity)**: The service provider being tracked. Already exists as part of the Provider Profiles module.
- **Customer (external entity)**: The customer who is tracking the provider. Already exists as part of the Users module.

## API Contract & DTOs *(mandatory)*

- **DTO-001 - Start Tracking Request**: Provider initiates a tracking session for an accepted booking. Input includes the booking ID (derived from authenticated provider's active bookings). System validates booking status and that no active session exists. Response includes session ID, status ("active"), and start time.
- **DTO-002 - Location Update Request**: Provider sends a location update. Input includes latitude (required, -90 to 90), longitude (required, -180 to 180), speed (optional, meters per second), heading (optional, degrees 0-360). Response confirms receipt with a location ID and timestamp.
- **DTO-003 - Tracking Session Response**: Returns current tracking session details including session ID, booking ID, provider ID, customer ID, status, start time, end time, current location, estimated distance, and estimated arrival time.
- **DTO-004 - Tracking History Response**: Returns a paginated, chronological list of location updates for a completed tracking session. Each entry includes latitude, longitude, speed, heading, and recorded timestamp.
- **DTO-005 - Admin Tracking List Response**: Paginated, sorted list of all tracking sessions with filtering by status, booking, provider, customer, and date range. Each entry includes session summary with links to detail view.
- **DTO-006 - Admin Tracking Detail Response**: Full details of a single tracking session including session info, route info, and associated booking/provider/customer details.
- **DTO-007 - Pause/Resume Tracking Response**: Confirms the status change of a tracking session. Returns session ID, previous status, new status, and timestamp.
- **SWAG-001**: All tracking endpoints require JWT authentication documentation. Provider endpoints scoped to own sessions only. Customer endpoints scoped to own bookings only. Admin endpoints require admin role documentation. Endpoints include request/response examples, error examples, and tracking workflow flow description.

### Measurable Outcomes

- **SC-001**: Providers can start a tracking session and send their first location update within 5 seconds of initiating the session.
- **SC-002**: Customers see the provider's latest location reflected within 5 seconds of the provider sending an update.
- **SC-003**: System supports up to 1,000 concurrent active tracking sessions without performance degradation.
- **SC-004**: System processes and stores at least 10 location updates per second per session without data loss.
- **SC-005**: 100% of location updates are stored immutably and can be retrieved on demand for audit purposes.
- **SC-006**: 100% of tracking lifecycle events (start, pause, resume, complete, cancel) trigger the corresponding notification events within 10 seconds.
- **SC-007**: Customers can retrieve their tracking history within 3 seconds for bookings with up to 1,000 location records.
- **SC-008**: Zero instances of customers accessing tracking data for bookings they do not own.
- **SC-009**: Zero instances of providers managing tracking sessions that do not belong to them.

## Assumptions

- The Authentication and Authorization modules (JWT, role-based access with Customer, Provider, Admin roles) are already in place and operational.
- The Booking Management module is already operational and provides booking status information and status change events.
- The Notifications module is already operational and can accept notification events for tracking-related triggers.
- "Provider Arrived Nearby" is triggered based on a configurable distance threshold (default 500 meters) between the provider's current location and the booking's service address. Actual geofencing implementation is deferred to future map provider integration.
- Distance remaining and estimated arrival time are stored as route information fields. Actual calculations will be handled by external map providers in a future integration; initial implementation stores placeholder values or provider-reported estimates.
- Location update frequency is determined by the provider's client application. The system accepts and processes updates as they arrive without enforcing a minimum interval.
- Tracking history is retained for audit purposes for 90 days after booking completion, in line with industry standards. Older history may be archived.
- The real-time communication layer (WebSockets/Socket.IO/SSE) is designed as an event-driven architecture. Initial implementation uses periodic polling via REST endpoints with infrastructure for future event-driven push updates.
- The system assumes providers have network connectivity to send location updates. Intermittent connectivity may result in gaps in the location history.
- Destination location for route information is derived from the booking's service address as defined in the Address Management module.
