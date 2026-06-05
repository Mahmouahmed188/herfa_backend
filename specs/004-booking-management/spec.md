# Feature Specification: Booking Management System

**Feature Branch**: `004-booking-management`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Design and implement the Booking Management System for the Herfa Backend."

## User Scenarios & Testing

### User Story 1 - Customer Creates and Tracks a Booking (Priority: P1)

A customer browses available services, selects a provider, and creates a booking with their preferred date, time, and address. They receive confirmation and can track the booking status as the provider accepts, travels, works, and completes the service. If needed, they can cancel before the provider accepts.

**Why this priority**: This is the core transaction flow of the platform — without it, no service can be requested or fulfilled.

**Independent Test**: A customer can create a booking for a valid service and provider, see it appear in their booking history with "pending" status, and cancel it before the provider responds.

**Acceptance Scenarios**:

1. **Given** a customer is authenticated with a valid account, **When** they submit a booking with a valid service, provider, address, date, and time, **Then** the booking is created with status "pending" and a unique booking number is returned.
2. **Given** a customer has a pending booking, **When** they view their booking history, **Then** the booking appears with current status, scheduled details, and the provider's information.
3. **Given** a customer has a pending booking, **When** they cancel it, **Then** the booking status changes to "cancelled" and the provider is notified.
4. **Given** a customer has a completed booking, **When** they attempt to cancel it, **Then** the system rejects the request with an appropriate message.

---

### User Story 2 - Provider Manages Incoming Bookings (Priority: P1)

A provider receives booking requests from customers, reviews the details, and decides to accept or reject. Once accepted, they progress the booking through work stages: on the way, in progress, and completed.

**Why this priority**: Providers are the service fulfillment side of the marketplace — without provider workflow, bookings cannot be fulfilled.

**Independent Test**: A provider can view their assigned bookings, accept a pending request, update its status through each stage, and complete the job.

**Acceptance Scenarios**:

1. **Given** a provider is authenticated, **When** they view their assigned bookings, **Then** they see only bookings assigned to them, sorted by creation date.
2. **Given** a provider has a pending booking assigned to them, **When** they accept it, **Then** the status changes to "accepted" and the customer is notified.
3. **Given** a provider has a pending booking, **When** they reject it, **Then** the status changes to "rejected" with an optional reason, and the customer is notified.
4. **Given** a provider has accepted a booking, **When** they mark it as "on the way", **Then** the status updates and the customer can see the provider is en route.
5. **Given** a provider has marked a booking as "on the way", **When** they mark it as "in progress", **Then** the status updates to indicate work has started.
6. **Given** a provider has a booking "in progress", **When** they mark it as "completed", **Then** the status updates, a completion timestamp is recorded, and the customer is notified.

---

### User Story 3 - Admin Oversees All Bookings (Priority: P2)

An administrator monitors all bookings across the platform, investigates disputes, and can intervene by cancelling problematic bookings with proper audit logging.

**Why this priority**: Admin oversight ensures platform integrity and dispute resolution, but is not required for the core booking flow to operate.

**Independent Test**: An admin can view all bookings with filters, see detailed history of any booking, and cancel a booking with a recorded reason.

**Acceptance Scenarios**:

1. **Given** an admin is authenticated, **When** they view all bookings, **Then** they see every booking on the platform with search, filter, and pagination controls.
2. **Given** an admin views a specific booking, **When** they request its history, **Then** they see the complete immutable audit trail of all status changes.
3. **Given** an admin needs to intervene in a booking, **When** they cancel it with a reason, **Then** the booking is cancelled, the reason is recorded, both customer and provider are notified, and the action is logged in the audit trail.
4. **Given** an admin attempts to cancel a completed booking, **Then** they receive a warning that the service has been delivered, and the cancellation is still permitted but logged with heightened severity.

---

### User Story 4 - Customer Searches and Filters Bookings (Priority: P3)

A customer with many bookings can search, filter, and sort their history to quickly find specific past or upcoming appointments.

**Why this priority**: Search and filtering improve the user experience but are not critical for the initial booking flow to function.

**Independent Test**: A customer can filter their bookings by status, date range, and search by booking number.

**Acceptance Scenarios**:

1. **Given** a customer has multiple bookings, **When** they filter by status "completed", **Then** only completed bookings are shown.
2. **Given** a customer has bookings across different dates, **When** they specify a date range, **Then** only bookings within that range are returned.
3. **Given** a customer knows their booking number, **When** they search for it, **Then** the matching booking is displayed.

---

### Edge Cases

- What happens when a customer tries to book a service that does not exist or belongs to a different provider?
- How does the system handle a provider trying to accept a booking that was already accepted or cancelled by another action?
- What happens when a provider tries to update the status of a booking that belongs to another provider?
- How does the system behave when a booking is created with a past date or time?
- What happens if two providers try to accept the same booking simultaneously?
- How does the system handle a customer attempting to cancel a booking that is already in "in progress" state?
- What happens when a provider marks a booking as "completed" that was already completed?
- How does the system behave when there are no bookings matching the applied filters?

## Requirements

### Functional Requirements

- **FR-001**: Customers MUST be able to create a booking by selecting a service, provider, address, preferred date, and preferred time.
- **FR-002**: System MUST validate that the selected service exists and the selected provider owns that service.
- **FR-003**: System MUST validate that the booking date is not in the past and the time is valid.
- **FR-004**: System MUST generate a unique booking number for each booking upon creation.
- **FR-005**: System MUST assign status "pending" to newly created bookings.
- **FR-006**: Customers MUST be able to view their own bookings with status and details.
- **FR-007**: Customers MUST be able to cancel their own bookings only when status is "pending".
- **FR-008**: Providers MUST be able to view bookings assigned to them.
- **FR-009**: Providers MUST be able to accept or reject pending bookings assigned to them.
- **FR-010**: Providers MUST be able to transition bookings through "accepted" → "on the way" → "in progress" → "completed" stages in order.
- **FR-011**: System MUST enforce valid status transitions and reject invalid ones with a clear error.
- **FR-012**: System MUST prevent duplicate status transitions (e.g., marking "completed" twice).
- **FR-013**: System MUST prevent status updates on completed or cancelled bookings.
- **FR-014**: Administrators MUST be able to view all bookings across the platform.
- **FR-015**: Administrators MUST be able to cancel any booking with a mandatory cancellation reason.
- **FR-016**: System MUST record every status change in an immutable audit log including old status, new status, who changed it, and timestamp.
- **FR-017**: System MUST support searching bookings by booking number.
- **FR-018**: System MUST support filtering bookings by status, provider, customer, date range, service, and category.
- **FR-019**: System MUST support pagination and sorting of booking lists.
- **FR-020**: System MUST restrict customers to accessing only their own bookings.
- **FR-021**: System MUST restrict providers to accessing only bookings assigned to them.
- **FR-022**: System MUST require authentication for all booking endpoints.
- **FR-023**: System MUST prevent customers from modifying completed or cancelled bookings.
- **FR-024**: System MUST record a completion timestamp when a booking reaches "completed" status.
- **FR-025**: System MUST record a cancellation timestamp and reason when a booking is cancelled.
- **FR-026**: System MUST emit event hooks for all booking status changes to support future notifications integration.

### Key Entities

- **Booking**: Represents a service request from a customer to a provider. Contains customer details, provider assignment, service reference, scheduled date/time, address information, current status, and completion/cancellation timestamps.
- **Booking Status History**: An immutable audit log recording every status change for a booking. Tracks old status, new status, who made the change, and when it occurred. Each booking has one or more history records forming a complete audit trail.

## API Contract & DTOs

- **DTO-001 — Create Booking Request**: Service ID, provider ID, address line, city, latitude, longitude, scheduled date, scheduled time, notes (optional). Validation: service and provider must exist and be linked, date must not be in the past, time must be a valid 24-hour format.
- **DTO-002 — Booking Response**: Booking number, customer name, provider name, service name, address details, scheduled date and time, current status, notes, timestamps (created, updated, completed, cancelled), cancellation reason. Includes status history array.
- **DTO-003 — Update Status Request**: Target status for the transition. Validation: must be a valid next status per transition rules.
- **DTO-004 — Cancel Booking Request**: Cancellation reason (mandatory for admin, optional for customer). Validation: only allowed from eligible statuses.
- **DTO-005 — Booking Filter Parameters**: Status, provider ID, customer ID, date range (start, end), service ID, category ID, search by booking number, page number, page size, sort field, sort direction.
- **DTO-006 — Paginated Response**: Items array, total count, page number, page size, total pages.
- **SWAG-001**: Swagger documentation for all endpoints including request/response examples and error codes.
- **SWAG-002**: Documentation of the complete status transition workflow in Swagger.
- **SWAG-003**: Documentation of role-based auth requirements per endpoint.

### Measurable Outcomes

- **SC-001**: Customers can create a booking in under 2 minutes from selecting a service to confirmation.
- **SC-002**: Booking status updates are reflected within 5 seconds of provider action.
- **SC-003**: 99.9% of valid booking creation requests succeed on first attempt without requiring retries.
- **SC-004**: Audit trail for any booking is complete and verifiable — no status change is ever lost or overwritten.
- **SC-005**: Invalid status transitions are rejected 100% of the time with a clear explanation to the user.
- **SC-006**: Search and filter queries return results within 3 seconds even with 100,000+ bookings in the system.

## Assumptions

- Booking number format is auto-generated as a unique human-readable identifier (e.g., sequential or timestamp-based).
- Time slots are specified in 24-hour HH:MM format with no predefined slot restrictions.
- Pricing and payment processing are out of scope — bookings are service requests only, with payment integration planned for a future module.
- Rescheduling or modifying booking details after creation is out of scope for this version.
- Provider rejection is only allowed on pending bookings (before acceptance).
- Admin cancellation is permitted from any non-completed state and is always logged with heightened audit severity.
- The system reuses the existing authentication and role-based authorization infrastructure from the Authentication and Users modules.
- Service and provider data are provided by the existing Services and Provider Profiles modules.
- Address validation (geocoding) is out of scope for this version — address fields are free text with lat/lng provided by the customer.
- The system emits events/hooks for status changes but does not implement actual notification delivery — that is handled by a separate Notifications module.
- Duplicate booking prevention (e.g., same customer booking the same provider for the same time slot) is handled at the application level.
