# Implementation Plan: Real-Time Tracking System

**Branch**: `010-real-time-tracking` | **Date**: 2026-06-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/010-real-time-tracking/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a real-time provider location tracking module for active bookings. The system manages tracking sessions (start/pause/resume/complete), stores immutable location history, provides REST endpoints for providers (manage tracking), customers (view location/history), and admins (oversight). Integrates with existing WebSocket gateways (`TrackingGateway`), event-emitter for notifications, and the Booking Management module for lifecycle hooks.

## Technical Context

**Language/Version**: NestJS 10.3 / TypeScript 5.x / Node.js 20+

**Primary Dependencies**: @nestjs/typeorm, @nestjs/websockets, @nestjs/platform-socket.io, @nestjs/event-emitter, class-validator, class-transformer, @nestjs/swagger, @nestjs/jwt, @nestjs/passport, socket.io, typeorm

**Storage**: PostgreSQL (UUID primary keys). Dual-ORM approach: TypeORM entities (primary) + Prisma schema (for migrations/SDK generation)

**Testing**: Jest (`*.spec.ts` files alongside modules)

**Target Platform**: Backend API (NestJS modules under `src/modules/tracking/`)

**Project Type**: Web-service (NestJS Modules)

**Performance Goals**: <500ms p95 for REST endpoints; sub-second location propagation from provider update to customer visibility; support 1,000 concurrent active sessions

**Constraints**: REST conventions with `/api/v1/` prefix, UUID primary keys, structured error responses `{ success, message, errorCode }`, JWT authentication, role-based guards

**Scale/Scope**: Herfa Platform (Customer/Provider Marketplace) - Tracking module for 010-real-time-tracking feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined? — Yes, `tracking_sessions` + `tracking_locations` + route info fields defined in spec
- [x] P2: Clean Architecture followed (Controller -> Service -> Repository)? — Yes, existing NestJS pattern with separate controllers, services, and TypeORM repositories
- [x] P3: Dedicated NestJS module planned? — Yes, `src/modules/tracking/` already exists with gateway stubs; will be extended
- [x] P4/P6: DTOs & Swagger decorators included? — Yes, enumerated in spec (DTO-001 through DTO-007, SWAG-001)
- [x] P7/P8: JWT/Roles/Guards identified? — Yes, Customer/Provider/Admin roles with ownership guards
- [x] P9: PostgreSQL UUIDs & Timestamps included? — Yes, UUID PKs with createdAt/updatedAt on sessions, recordedAt on locations
- [x] P10/P11: Structured Errors & Logging planned? — Yes, consistent with existing `AllExceptionsFilter` and NestJS Logger
- [x] P15: All 12 workflow steps accounted for? — Yes, full workflow from entities through tests

## Project Structure

### Documentation (this feature)

```text
specs/010-real-time-tracking/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/modules/tracking/
├── tracking.module.ts          # Existing; extend with new imports
├── tracking.gateway.ts         # Existing WebSocket gateway; extend with tracking events
├── tracking.service.ts         # NEW: Business logic
├── tracking.controller.ts      # NEW: Customer endpoints
├── provider-tracking.controller.ts  # NEW: Provider endpoints
├── admin-tracking.controller.ts     # NEW: Admin endpoints
├── dto/
│   ├── start-tracking.dto.ts       # POST /tracking/start
│   ├── location-update.dto.ts      # PATCH /tracking/location
│   ├── tracking-session.dto.ts     # Response DTO
│   ├── tracking-history.dto.ts     # Response DTO
│   ├── tracking-filter.dto.ts      # Query filters
│   └── pause-resume.dto.ts         # Response DTO
├── guards/
│   ├── tracking-ownership.guard.ts # Provider/customer session ownership
│   └── booking-tracking.guard.ts   # Verify booking belongs to provider
├── events/
│   └── tracking.events.ts          # Event emitter payloads
└── test/
    ├── tracking.service.spec.ts
    ├── tracking.controller.spec.ts
    └── provider-tracking.controller.spec.ts

src/entities/
├── tracking-session.entity.ts      # NEW: TypeORM entity
└── tracking-location.entity.ts     # NEW: TypeORM entity

prisma/
└── schema.prisma                   # EXTEND: Add tracking_sessions + tracking_locations models
```

**Structure Decision**: Single NestJS project with a dedicated `tracking` module following existing conventions. Provider, customer, and admin concerns separated into distinct controller classes within the same module, consistent with the existing `bookings` module pattern (`BookingsController`, `ProviderBookingsController`, `AdminBookingsController`).

## Complexity Tracking

No constitution violations detected. All principles satisfied with standard patterns.
