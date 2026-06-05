# Research: Booking Management System

## Architecture Research

### ORM Decision: TypeORM (Primary)

**Decision**: Use TypeORM as the primary ORM for Booking entities and repositories, consistent with all existing modules.

**Rationale**:
- All 18 existing NestJS modules (`src/modules/`) use TypeORM with `@nestjs/typeorm` and `@InjectRepository()`
- TypeORM entities are centralized in `src/entities/` with a barrel export in `index.ts`
- The existing `Job` entity (closest analog to Booking) uses TypeORM decorators
- `PrismaModule`/`PrismaService` exists but is unused by any module for data access
- Prisma schema is maintained as a secondary schema reference

**Alternatives considered**: Prisma — rejected because no existing module uses it for data access; would require new patterns and increase inconsistency.

### Module Structure Pattern

**Decision**: Follow the established `src/modules/<feature>/` pattern with controllers, service, and `dto/` directory.

**Rationale**:
- All 18 existing modules follow this pattern
- Controllers can be co-located in one file (e.g., `ServicesController`, `AdminServicesController`, `ProviderServicesController` in `services.controller.ts`)
- DTOs follow class-validator + @nestjs/swagger convention
- Entities remain in `src/entities/` (not duplicated in the module)

**Reference module**: `src/modules/services/` — has three controller classes in one file (ServicesController, ProviderServicesController, AdminServicesController), a service, and a `dto/` folder.

### Authentication & Authorization

**Decision**: Reuse `JwtAuthGuard` + `RolesGuard` with `@Roles()` decorator.

**Rationale**:
- Existing guards in `src/common/guards/` provide all required auth
- `JwtAuthGuard` validates JWT tokens, attaches user to `req.user`
- `RolesGuard` reads metadata from `@Roles()` decorator
- `@CurrentUser()` decorator extracts user from request
- A new `BookingOwnershipGuard` is needed for customer/provider data isolation

**Existing guard files**:
- `src/common/guards/jwt-auth.guard.ts`
- `src/common/guards/roles.guard.ts`
- `src/common/guards/verification.guard.ts`

### Booking Number Generation

**Decision**: Generate booking numbers using UUID-based approach for uniqueness.

**Rationale**:
- The project already has the `uuid` package as a dependency
- UUIDs guarantee uniqueness without coordination
- Can be formatted as a shorter human-readable ID (e.g., `BKG-XXXXXXXX`) for display
- Existing project uses UUIDs for all identifiers

### Status Transition Engine

**Decision**: Implement a centralized status transition validator with an explicit state machine.

**Rationale**:
- Required by spec: "Status transitions must be validated"
- State machine pattern prevents invalid transitions at a single point
- Easy to test exhaustively
- Existing `Job` entity has a simpler status pattern — Booking requires more rigor

**Valid transitions**:
- `pending` → `accepted`, `rejected`, `cancelled`
- `accepted` → `on_the_way`, `cancelled` (admin)
- `on_the_way` → `in_progress`, `cancelled` (admin)
- `in_progress` → `completed`, `cancelled` (admin)
- `completed` → (terminal)
- `rejected` → (terminal)
- `cancelled` → (terminal)

### Notification Events

**Decision**: Use `@nestjs/event-emitter` (already in dependencies) to emit events for all status changes.

**Rationale**:
- `@nestjs/event-emitter` is already installed (v2.0.4)
- Loose coupling — the notification module can listen for events without direct dependency
- Events can be extended for future integrations (reviews, payments, tracking)
- Existing project pattern — no other module currently uses it, making this the first adopter

### Data Validation

**Decision**: Apply class-validator decorators on all DTOs with explicit error messages.

**Rationale**:
- Consistent with all existing DTOs
- `class-validator` 0.14 is already a dependency
- Allows Swagger to auto-generate documentation from decorators

### Pagination & Filtering

**Decision**: Extend the existing `PaginationDto` from `src/common/dto/pagination.dto.ts` for booking-specific filters.

**Rationale**:
- Reuse existing `PaginationDto` (page, limit fields)
- Create `BookingFilterDto` that extends it with booking-specific filter fields
- Consistent with `ProviderSearchDto` pattern that extends `PaginationDto`

### Testing Strategy

**Decision**: Jest unit tests for service/controller/guard + supertest e2e tests.

**Rationale**:
- Jest is the existing test framework (jest 29 + ts-jest)
- Test location: co-located `*.spec.ts` files per existing pattern
- e2e test in `test/` directory per `test/jest-e2e.json` configuration
- Test database: in-memory SQLite via TypeORM (existing dev pattern)

### Database Indexes

**Decision**: Add indexes on frequently filtered/joined columns.

**Rationale**:
- `bookingNumber` — unique index for search lookups
- `customerId` — index for customer booking history queries
- `providerId` — index for provider assigned booking queries
- `status` — index for status filtering
- `scheduledDate` — index for date range queries
- `bookingId` on `booking_status_history` — index for history lookups
- Composite index on `(customerId, status)` for common customer filter pattern
- Composite index on `(providerId, status)` for common provider filter pattern
