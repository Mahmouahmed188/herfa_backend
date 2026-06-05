# Feature Specification: Address Management System

**Feature Branch**: `006-address-management`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description of Address Management System for Herfa Backend

## User Scenarios & Testing

### User Story 1 — Customer manages saved service addresses (Priority: P1)

Customers can save, view, edit, delete, and organize multiple service addresses (Home, Work, Villa, etc.) for use during booking. A single default address can be set, and changing it automatically clears the previous default.

**Why this priority**: Address management is the core capability — without it, no downstream feature (booking, provider matching) can function. This is the MVP.

**Independent Test**: Authenticated customer creates an address via POST /addresses, verifies it appears in GET /addresses, sets it as default via PATCH /addresses/:id/set-default, confirms old default is unset, edits via PATCH /addresses/:id, and deletes via DELETE /addresses/:id.

**Acceptance Scenarios**:

1. **Given** an authenticated customer with no saved addresses, **When** they POST /addresses with valid data, **Then** a 201 response returns the created address with a UUID id and `isDefault: false`.
2. **Given** an authenticated customer has address A set as default, **When** they create or set address B as default, **Then** address A's `isDefault` becomes false and address B's `isDefault` becomes true.
3. **Given** an authenticated customer owns an address, **When** they PATCH /addresses/:id with updated fields, **Then** the address is updated and the response reflects the changes.
4. **Given** an authenticated customer owns an address, **When** they DELETE /addresses/:id, **Then** the address is removed and subsequent GET /addresses/:id returns 404.
5. **Given** an authenticated customer tries to access an address belonging to another user, **When** they GET /addresses/:id, **Then** a 403 Forbidden error is returned.

---

### User Story 2 — Customer selects address during booking (Priority: P2)

When creating a booking, customers can pick from their saved addresses or automatically use their default address. The booking stores a snapshot of the selected address so future changes to the address don't affect historical bookings.

**Why this priority**: Directly enables the booking flow with real service locations. Depends on US1 being complete.

**Independent Test**: Customer has saved addresses with one set as default. Creates a booking that auto-selects the default address. Verifies the booking record contains an address snapshot (not a live reference). Then updates the original address and confirms the booking snapshot is unchanged.

**Acceptance Scenarios**:

1. **Given** a customer with saved addresses has one set as default, **When** they create a booking without specifying an address, **Then** the default address snapshot is used and the booking is created successfully.
2. **Given** a customer with saved addresses, **When** they create a booking and explicitly select a non-default saved address, **Then** the selected address snapshot is stored in the booking.
3. **Given** a customer's saved address is updated after a booking was created, **When** the booking record is viewed, **Then** the snapshot still reflects the original address data at booking time.

---

### User Story 3 — Admin views customer addresses for support (Priority: P3)

Administrators can browse customer addresses in read-only mode to assist with support inquiries and dispute resolution.

**Why this priority**: Important for operational support but not required for launch.

**Independent Test**: Admin logs in, views all addresses for a specific customer via an admin endpoint, and confirms no edit/delete actions are available.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they GET /admin/addresses?userId=<id>, **Then** they see a paginated list of that customer's addresses.
2. **Given** an authenticated admin user, **When** they attempt to PATCH or DELETE an address, **Then** the system returns 403 Forbidden.

---

### Edge Cases

- What happens when a customer with no default address creates a booking without specifying one? — Booking should require an explicit address selection or fail with a validation error.
- How does the system handle creating an address with coordinates exactly at boundary values (lat: 90 or -90, lon: 180 or -180)? — Boundary values should be accepted as valid.
- What happens when a customer deletes the address currently referenced by an in-progress booking? — The booking snapshot is preserved; the address record is deleted normally.
- How does the system handle customers with a very large number of saved addresses (e.g., 100+)? — Pagination ensures retrieval remains performant.
- What happens when two concurrent requests try to set different addresses as default? — The last write wins; only one remains default.

## Requirements

### Functional Requirements

- **FR-001**: Authenticated customers MUST be able to create a new address with label, fullAddress, buildingNumber, optional floorNumber, optional apartmentNumber, city, area, latitude, and longitude.
- **FR-002**: The system MUST validate latitude is between -90 and 90 (inclusive) and longitude is between -180 and 180 (inclusive) on creation and update.
- **FR-003**: The address label MUST be required and limited to a maximum length.
- **FR-004**: The fullAddress field MUST be required.
- **FR-005**: Only one address per customer MAY be marked as default at any time.
- **FR-006**: Setting an address as default MUST automatically unset any existing default for the same customer.
- **FR-007**: Customers MUST only be able to access, modify, and delete addresses they own.
- **FR-008**: Provider users MUST have no access to any address endpoints.
- **FR-009**: Admin users MUST have read-only access to all customer addresses for support purposes.
- **FR-010**: The system MUST support pagination when listing addresses.
- **FR-011**: The system MUST support sorting addresses by creation date and by default status.
- **FR-012**: When a booking is created with a selected address, the system MUST store a snapshot of the address data within the booking record.
- **FR-013**: Subsequent updates to a saved address MUST NOT modify previously stored booking snapshots.
- **FR-014**: Customers MUST be able to update all fields of their existing addresses.
- **FR-015**: Customers MUST be able to delete their addresses.
- **FR-016**: The system MUST return appropriate 4xx errors for validation failures with descriptive messages.
- **FR-017**: All address endpoints MUST require JWT authentication.
- **FR-018**: The address list endpoint MUST return addresses sorted by default status first (default addresses at top), then by creation date descending.

### Key Entities

- **Address**: Represents a customer's service location. Belongs to a single User. Contains label, full address details, geocoordinates, and a default flag. Multiple addresses per user.
- **User**: The customer who owns addresses. One-to-many relationship with Address.
- **Booking (integration point)**: References a snapshot of the selected address at booking creation time, not a live foreign key to the Address table.

## API Contract & DTOs

- **DTO-001** — CreateAddressDto: label (string, required, maxLength), fullAddress (string, required), buildingNumber (string, required), floorNumber (number, optional), apartmentNumber (number, optional), city (string, required), area (string, required), latitude (number, required, min -90, max 90), longitude (number, required, min -180, max 180).
- **DTO-002** — UpdateAddressDto: Same as CreateAddressDto but all fields optional (partial update).
- **DTO-003** — AddressResponseDto: id (uuid), userId (uuid), label, fullAddress, buildingNumber, floorNumber, apartmentNumber, city, area, latitude, longitude, isDefault (boolean), createdAt (ISO timestamp), updatedAt (ISO timestamp).
- **DTO-004** — AddressFilterDto: page, limit, sortBy (createdAt | isDefault), sortOrder (ASC | DESC). Extends PaginationDto.
- **DTO-005** — SetDefaultAddressDto (empty body; the address ID in the URL identifies which address to set as default).
- **DTO-006** — AdminAddressFilterDto: userId (uuid, required for admin filtering), plus pagination and sorting fields.
- **SWAG-001**: All endpoints must include @ApiTags, @ApiBearerAuth, @ApiOperation summaries, @ApiResponse with status codes and example bodies. Request/response DTOs must use @ApiProperty with descriptions and examples.

### Measurable Outcomes

- **SC-001**: Customers can create an address in under 30 seconds from account login.
- **SC-002**: Address list page loads in under 500ms for customers with up to 50 saved addresses.
- **SC-003**: Default address lookup during booking creation completes in under 200ms.
- **SC-004**: Admin support staff can retrieve a customer's addresses in under 2 clicks from the admin panel.
- **SC-005**: Zero data loss on concurrent default-address updates (exactly one default per customer always).

## Assumptions

- **TypeORM will be used for the Address entity and database access**, following the existing codebase patterns (not Prisma, despite the user mentioning Prisma in deliverables). The existing project uses TypeORM with PostgreSQL (dev: SQLite).
- **floorNumber and apartmentNumber are numeric (integer) fields**, suitable for sorting and future map display logic.
- **Address label maximum length is 100 characters**, consistent with common address label conventions.
- **Booking address snapshot integration is a separate future task** that depends on this module being available. This spec defines the Address module; booking integration will reference it.
- **The existing PaginationDto from the common module will be reused/extended**, following conventions established in previous features (reviews, bookings).
- **JWT auth and role-based guards already exist** in the codebase and will be reused rather than recreated.
- **Address coordinates use the WGS84 standard** (GPS coordinate system), which is the standard for mapping services.
