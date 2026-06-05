# Implementation Plan: Booking Management System

**Branch**: `004-booking-management` | **Date**: 2026-06-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-booking-management/spec.md`

## Summary

Implement a full Booking Management System enabling customers to request services from providers with a controlled lifecycle workflow. The system supports three user roles (Customer, Provider, Admin) with role-appropriate actions, immutable status history audit trails, search/filter/pagination, and event hooks for future notification integration. Built as a dedicated NestJS module following the existing project conventions (TypeORM entities, class-validator DTOs, JWT + RolesGuard auth).

## Technical Context

**Framework/Version**: NestJS 10.3 / Node.js (TypeScript 5.3)

**Primary Dependencies**:
- `@nestjs/typeorm` 10 + `typeorm` 0.3 (ORM)
- `class-validator` 0.14 + `class-transformer` 0.5 (Validation)
- `@nestjs/swagger` 7.3 (API documentation)
- `@nestjs/jwt` 10 + `passport-jwt` 4.0 (Authentication)
- `@nestjs/event-emitter` 2.0 (Event hooks for notifications)
- `@nestjs/bull` 10 + `bull` 4.12 (Background job processing, optional)
- `winston` 3.11 (Logging)
- `uuid` 9.0 (Booking number generation)

**Storage**: PostgreSQL (primary) / SQLite (dev via better-sqlite3) — TypeORM entities with UUID primary keys

**Testing**: Jest 29 (unit + e2e via supertest)

**Target Platform**: Backend API (NestJS REST)

**Project Type**: Web-service (NestJS Modules)

**Performance Goals**: Booking list queries return in under 3s with 100K+ records; status updates reflect within 5s of provider action

**Constraints**:
- REST API conventions
- UUID primary keys only (no auto-increment IDs)
- All entities include createdAt/updatedAt timestamps
- Structured error responses (`{ success, message, errorCode }`)
- JWT authentication required for all endpoints
- Role-based authorization (Customer, Provider, Admin)
- Status transitions must be validated before changes

**Scale/Scope**: Herfa Platform — Customer/Provider service marketplace; prepared for future Reviews, Notifications, Payments, and Tracking modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined — Two entities planned: `Booking` and `BookingStatusHistory` with all required fields (UUID PKs, relationships, timestamps)
- [x] P2: Clean Architecture followed — Controller → Service → Repository (TypeORM repositories via `@InjectRepository`), thin controllers, business logic in services
- [x] P3: Dedicated NestJS module planned — `src/modules/bookings/` with separate controllers for customer, provider, and admin endpoints
- [x] P4/P6: DTOs & Swagger decorators included — Create/Update/Filter DTOs with class-validator and @ApiProperty decorators
- [x] P7/P8: JWT/Roles/Guards identified — `JwtAuthGuard` on all endpoints, `RolesGuard` with `@Roles()` for admin/provider differentiation, `@CurrentUser()` decorator for user context
- [x] P9: PostgreSQL UUIDs & Timestamps included — `@PrimaryGeneratedColumn('uuid')`, `@CreateDateColumn`, `@UpdateDateColumn`
- [x] P10/P11: Structured Errors & Logging planned — Consistent error response format, Winston logging for all status transitions and critical actions
- [x] P15: All 12 workflow steps accounted for — Analyze → Design entities → Migration → DTOs → Module → Service → Controller → Guards → Swagger → Tests → Contract verification → Integration notes

## Project Structure

### Documentation (this feature)

```text
specs/004-booking-management/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── bookings.contract.md
│   ├── booking-history.contract.md
│   └── events.contract.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── entities/
│   ├── booking.entity.ts
│   ├── booking-status-history.entity.ts
│   └── index.ts              # (updated with new exports)
├── modules/
│   └── bookings/
│       ├── bookings.module.ts
│       ├── bookings.controller.ts      # Customer endpoints
│       ├── bookings.service.ts
│       ├── dto/
│       │   ├── create-booking.dto.ts
│       │   ├── booking-response.dto.ts
│       │   ├── booking-filter.dto.ts
│       │   ├── update-status.dto.ts
│       │   └── cancel-booking.dto.ts
│       └── guards/
│           └── booking-ownership.guard.ts   # Ownership verification
├── common/
│   └── guards/
│       └── (reuse existing JwtAuthGuard, RolesGuard)

test/
├── unit/
│   └── bookings/
│       ├── bookings.service.spec.ts
│       └── bookings.controller.spec.ts
└── e2e/
    └── bookings.e2e-spec.ts

prisma/
└── schema.prisma              # (updated with Booking + BookingStatusHistory models)
```

**Structure Decision**: Follows the existing NestJS monolith pattern used by all other modules (services, providers, auth, etc.) — centralized entities in `src/entities/`, module code in `src/modules/<feature>/`, tests in `test/`. This is the established convention and provides consistency.

## Complexity Tracking

*No Constitution violations identified — all patterns follow existing conventions.*
