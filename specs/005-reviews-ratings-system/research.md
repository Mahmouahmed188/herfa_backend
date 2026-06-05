# Research: Reviews & Ratings System

## Unknown 1: bookingId vs jobId on Review entity

**Decision**: Add `bookingId` + `booking` relation to Review entity alongside existing `jobId`. Keep `jobId` nullable for backward compatibility.

**Rationale**: Spec explicitly requires booking-based reviews (FR-001: "bookings with status completed"). The existing reviews module skeleton references `Job`, but the platform has both `Booking` (modern) and `Job` (legacy) systems. Adding `bookingId` as the primary foreign key with an index enables the spec requirements while maintaining backward compat.

**Alternatives considered**:
- Replace `jobId` with `bookingId` entirely: Would break existing references if any consumers depend on `jobId`
- Add `bookingId` only (drop `jobId`): No backward compat
- Keep both with `bookingId` as required and `jobId` as nullable: Chosen approach — minimal risk, clean migration path

---

## Unknown 2: ProviderRatingStats entity vs ProviderProfile.rating

**Decision**: Create new `ProviderRatingStats` entity (FR-022, SC-002, SC-003). Keep `ProviderProfile.rating` as a simple summary for backward compatibility; update it alongside stats.

**Rationale**: Spec explicitly requires per-star-level distribution (FR-007), optimized aggregation (FR-021: "not full-table scan"), and atomic updates (FR-006). A separate cached aggregate entity fulfills all requirements with O(1) read performance. The existing `ProviderProfile.rating` field is a simple decimal — insufficient for distribution data.

**Alternatives considered**:
- Compute on-the-fly from reviews: Full-table scan on every request (violates FR-021)
- Extend ProviderProfile with distribution columns: Tight coupling, violates module separation
- Materialized view: Overkill for this use case, adds DB-specific complexity

---

## Unknown 3: Optimized aggregation approach

**Decision**: TypeORM repository pattern with atomic updates on the `ProviderRatingStats` entity. Each review create/update/delete triggers a recalculation using TypeORM query builder (not raw SQL).

**Rationale**: Follows the existing codebase conventions (all services use TypeORM repositories). Raw SQL (as used in the current skeleton's `updateProviderRating`) is inconsistent with the rest of the project. TypeORM query builder provides the same performance with better maintainability.

**Alternatives considered**:
- Raw SQL queries: Used in current skeleton but inconsistent with project conventions
- Database triggers: Hidden logic, harder to debug and test
- Event-sourced recalculation: Over-engineering for this scale

---

## Unknown 4: Event emission pattern

**Decision**: Follow `BookingService`'s `EventEmitter2` pattern. Emit `review.created`, `review.updated`, `review.removed` events with structured payload matching the booking pattern (`{ event, timestamp, data: { ... } }`).

**Rationale**: The existing EventEmitter2 infrastructure is already wired globally in `app.module.ts`. The Bookings module provides a clear reference implementation with `emitBookingEvent()` helper. FR-020 requires events for notification integration — the pattern is already established but no listeners exist yet (future implementation).

**Alternatives considered**:
- Bull queue events: Overkill for simple notification triggers
- Socket.io direct emit: Couples reviews to real-time layer
- Custom event bus: Would create unnecessary abstraction

---

## Unknown 5: Admin moderation audit logging pattern

**Decision**: Create `ModerationLog` entity following the `BookingStatusHistory` pattern. Fields: id (uuid), reviewId, adminId, action, reason, createdAt. Single-purpose entity for audit trail.

**Rationale**: FR-014 requires logging admin moderation actions (who, what, when, why). The `BookingStatusHistory` entity provides the closest pattern — separate history entity with FK reference, auto-timestamp, and action metadata. Creating a dedicated entity rather than extending BookingStatusHistory keeps concerns separated (bookings vs reviews vs moderation).

**Alternatives considered**:
- Extend BookingStatusHistory: Wrong domain — moderation is not a booking status transition
- Generic audit_logs table: Over-engineered for a single use case
- In-app logging only (Logger): Violates persistence requirement (FR-014)

---

## Technology Best Practices

### NestJS Module Organization
- Follow existing pattern: one controller per role (customer, provider, admin) within the same module
- DTOs in `dto/` subdirectory, guards in `guards/`, events in `events/`
- Module imports `TypeOrmModule.forFeature([Review, ProviderRatingStats, ModerationLog])`

### TypeORM Entity Conventions
- Table names: snake_case plural (`reviews`, `provider_rating_stats`, `moderation_logs`)
- UUID PK: `@PrimaryGeneratedColumn('uuid')`
- Foreign keys: both relation + `entityId: string` with `@JoinColumn({ name: 'snake_case' })`
- Timestamps: `@CreateDateColumn()` / `@UpdateDateColumn()`
- Indexes: `@Index()` on FK columns and query-filtered columns

### Validation Patterns
- `class-validator` decorators on all DTOs
- `@nestjs/swagger` `@ApiProperty()` / `@ApiPropertyOptional()` with descriptions and examples
- Extend `PaginationDto` for filter DTOs

### Response Format
- Success: wrapped in `TransformInterceptor` → `{ data, timestamp }`
- Error: global `AllExceptionsFilter` → `{ statusCode, message, error, timestamp, path }`

### Testing
- Unit tests: Jest with mocked repositories (follow existing `.spec.ts` patterns)
- Integration tests: supertest with NestJS testing module
