# Research: Address Management System

**Date**: 2026-06-05 | **Input**: [spec.md](spec.md)

## Purpose

Resolve architectural decisions for the Address Management System based on existing codebase conventions and industry best practices.

---

## Decision 1: Entity Framework & ORM

**Decision**: Use TypeORM with `@Entity('addresses')` decorator pattern
**Rationale**: The existing codebase (Review, Booking, ProviderProfile, User entities) all use TypeORM with specific decorator patterns. The spec assumption confirming TypeORM over Prisma is validated.
**Alternatives considered**: Prisma (mentioned in user deliverables but inconsistent with codebase), MikroORM, Sequelize — all rejected to maintain consistency with the 5 existing entities.

## Decision 2: Address Entity Design

**Decision**: Self-contained entity with value fields + User ManyToOne relation
**Rationale**:
- `userId` foreign key with `@ManyToOne(() => User)` follows the pattern used in Review (`customerId`), Booking (`customerId`, `providerId`)
- Coordinates stored as `decimal` columns with appropriate precision (lat: 10,7; lon: 11,7) matching the existing Booking entity pattern
- `isDefault` as boolean column with a unique constraint scoped per user (enforced application-level since SQLite doesn't support partial unique indexes)
**Alternatives considered**: Embedded value object, separate geolocation table — rejected for simplicity and query performance.

## Decision 3: Default Address Enforcement

**Decision**: Application-level enforcement (service method handles unsetting previous default)
**Rationale**: SQLite (dev) doesn't support partial unique indexes (`WHERE isDefault = true`). PostgreSQL does, but to keep dev/prod consistent, the logic is in the service layer with a transaction. The spec FR-005/FR-006 require exactly one default per customer.
**Alternatives considered**: Database-level partial unique index (PostgreSQL only), database trigger — rejected for cross-database compatibility during development.

## Decision 4: Controller Structure

**Decision**: Split controllers by role — `AddressesController` (customer) and `AdminAddressesController` (admin)
**Rationale**: Follows the exact pattern used by Reviews (ReviewsController, AdminReviewsController, ProviderReviewsController) and Bookings (BookingsController, AdminBookingsController). No provider controller needed (providers have no address access per spec FR-008).
**Alternatives considered**: Single controller with role-based method guards — rejected for separation of concerns and consistency.

## Decision 5: Address Ownership Guard

**Decision**: Create `AddressOwnershipGuard` following `BookingOwnershipGuard` pattern
**Rationale**: Guards in Review and Booking modules follow the same pattern: inject repository, extract user + param id, query entity, compare userId, throw ForbiddenException. The Address guard will follow this exactly.
**Alternatives considered**: Inline checks in service layer — rejected to keep controllers thin (Constitution P2 Clean Architecture).

## Decision 6: Booking Integration (Snapshot)

**Decision**: Booking entity already stores address as snapshot fields (addressLine, city, latitude, longitude). This feature does not alter the Booking entity. The Address module provides endpoints for customers to manage their addresses; the Booking module integration (auto-populating from selected/default address) is a separate integration task.
**Rationale**: The Booking entity already has inline address fields acting as snapshots. Per FR-013, address changes must not modify historical bookings. The existing design satisfies this requirement.
**Alternatives considered**: Adding a `addressId` FK to Booking — rejected because it would violate the snapshot requirement.

## Decision 7: Pagination Reuse

**Decision**: `AddressFilterDto` extends `PaginationDto` from `src/common/dto/pagination.dto.ts`
**Rationale**: The reviews feature (`ReviewFilterDto`) and the spec both confirm PaginationDto reuse. The existing PaginationDto provides `page` and `limit` with proper validation and Swagger decorators.
**Alternatives considered**: Inline pagination fields — rejected for DRY violation.

## Decision 8: Address Label Max Length

**Decision**: 100 characters maximum
**Rationale**: Common label field constraint accommodates "My Summer Vacation Home in Alexandria" while preventing abuse. The spec assumption confirms this.
**Alternatives considered**: 50, 200, 255 — 100 is a reasonable balance between usability and data integrity.

## Decision 9: Coordinate Type & Validation

**Decision**: Numeric (decimal) fields with @IsNumber() + @Min(-90)/@Max(90) for lat and @Min(-180)/@Max(180) for lon
**Rationale**: The Booking entity already stores coordinates as decimals. class-validator decorators provide built-in range validation per FR-002. WGS84 standard is the de facto GPS coordinate system.
**Alternatives considered**: String storage (existing Booking uses string for lat/lon in DTO but decimal in entity), PostGIS geometry type — rejected: strings require parsing overhead, PostGIS is over-engineered for the current scope.
