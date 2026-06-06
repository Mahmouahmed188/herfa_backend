# Implementation Plan: Admin Dashboard & Analytics System

**Branch**: `012-analytics-dashboard` | **Date**: 2026-06-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/012-analytics-dashboard/spec.md`

## Summary

Implement an Admin Dashboard & Analytics module for the Herfa Backend providing administrators with a centralized dashboard for monitoring platform operations, business performance, user activity, bookings, payments, provider performance, disputes, and growth metrics. The module will use pre-computed aggregation snapshots for performance, scheduled background jobs for periodic updates, and the existing NestJS/TypeORM patterns for entity management, DTOs, controllers, services, guards, and Swagger documentation.

## Technical Context

**Language/Version**: NestJS / Node.js / TypeScript

**Primary Dependencies**: TypeORM, class-validator, class-transformer, @nestjs/swagger, @nestjs/bull, exceljs (or similar)

**Storage**: PostgreSQL (UUID primary keys) via TypeORM entities

**Testing**: Jest (Unit & Integration)

**Target Platform**: Backend API

**Project Type**: Web-service (NestJS Modules)

**Performance Goals**: Dashboard overview <2s p95; analytics endpoints <3s p95 with 100K+ records; scheduled snapshot generation <5m

**Constraints**: REST conventions, UUIDs only, JWT auth, admin role guards, structured error responses

**Scale/Scope**: Herfa Platform (Customer/Provider Marketplace)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined? — YES, 2 entities specified (analytics_snapshots, admin_activity_logs)
- [x] P2: Clean Architecture followed? — YES, Controller → Service → Repository pattern
- [x] P3: Dedicated NestJS module planned? — YES, dedicated `analytics` module
- [x] P4/P6: DTOs & Swagger decorators included? — YES, 12 DTOs defined with validation rules + Swagger requirement
- [x] P7/P8: JWT/Roles/Guards identified? — YES, Admin-only with JWT + role guards
- [x] P9: PostgreSQL UUIDs & Timestamps included? — YES, UUID PKs + createdAt on all entities
- [x] P10/P11: Structured Errors & Logging planned? — YES, structured error responses + audit logging
- [x] P15: All 12 workflow steps accounted for? — YES, Analyze → Design → Migrate → DTOs → Module → Service → Controller → Guards → Swagger → Tests → Verify → Notes

**GATE Status**: ✅ PASS — All constitution principles satisfied. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/012-analytics-dashboard/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── entities/
│   ├── analytics-snapshot.entity.ts       # NEW
│   └── admin-activity-log.entity.ts       # NEW
├── modules/
│   └── analytics/
│       ├── analytics.module.ts            # Module definition
│       ├── analytics.controller.ts        # Dashboard & analytics endpoints
│       ├── analytics.controller.spec.ts
│       ├── reports.controller.ts          # Report generation endpoints
│       ├── reports.controller.spec.ts
│       ├── activity-logs.controller.ts    # Activity log endpoints
│       ├── services/
│       │   ├── dashboard.service.ts       # Overview aggregation
│       │   ├── user-analytics.service.ts  # User metrics
│       │   ├── provider-analytics.service.ts # Provider metrics
│       │   ├── booking-analytics.service.ts  # Booking metrics
│       │   ├── revenue-analytics.service.ts  # Revenue metrics
│       │   ├── review-analytics.service.ts   # Review metrics
│       │   ├── support-analytics.service.ts  # Support metrics
│       │   ├── geographic-analytics.service.ts # Geographic metrics
│       │   ├── analytics-snapshot.service.ts  # Snapshot generation
│       │   ├── report.service.ts              # Report generation & export
│       │   ├── activity-log.service.ts        # Activity log management
│       │   └── alert.service.ts               # Operational alert detection
│       ├── dto/
│       │   ├── dashboard-overview.dto.ts
│       │   ├── user-analytics.dto.ts
│       │   ├── provider-analytics.dto.ts
│       │   ├── booking-analytics.dto.ts
│       │   ├── revenue-analytics.dto.ts
│       │   ├── review-analytics.dto.ts
│       │   ├── support-analytics.dto.ts
│       │   ├── geographic-analytics.dto.ts
│       │   ├── date-range-filter.dto.ts
│       │   ├── report-filter.dto.ts
│       │   ├── activity-log.dto.ts
│       │   └── operational-alert.dto.ts
│       └── jobs/
│           ├── analytics-snapshot.job.ts     # Daily/weekly/monthly snapshots
│           └── alert-detection.job.ts        # Periodic alert checks
├── common/
│   └── guards/
│       └── admin-role.guard.ts               # EXISTING — reuse
└── migrations/
    └── [timestamp]-CreateAnalyticsTables.ts   # NEW (generated)
```

**Structure Decision**: Single NestJS backend project with dedicated `analytics` module under `src/modules/`. Analytics entities stored in `src/entities/` following the existing pattern. Reuses existing `JwtAuthGuard`, `RolesGuard`, `@Roles` decorator, `EventEmitter2`, and `BullModule` for scheduled jobs.

## Phase 0 — Research

*No [NEEDS CLARIFICATION] markers found in spec. Research focuses on confirming existing patterns and identifying best approaches for aggregation and export.*

### Research Tasks

1. **Existing admin dashboard pattern**: Located at `src/modules/admin/admin.service.ts` — already has a `getDashboardStats()` method with raw user counts, booking counts, and revenue aggregation via QueryBuilder. **Decision**: Extend with dedicated analytics module rather than modifying existing admin module.

2. **Existing Excel/CSV export libraries**: No existing export utility found in the codebase. **Decision**: Use `exceljs` or built-in Node.js CSV streaming for report exports.

3. **Background job infrastructure**: `BullModule` is configured in `app.module.ts` with Redis connection. Several modules use Bull queues. **Decision**: Use Bull queue processors for scheduled analytics snapshot generation and alert detection.

4. **Analytics aggregation approach**: Existing patterns use raw TypeORM QueryBuilder with `SELECT COUNT()`, `SUM()`, `GROUP BY` for aggregations. **Decision**: Create dedicated aggregation services that use QueryBuilder for real-time calculations and pre-computed snapshots for historical data.

5. **Geographic data availability**: User entity does not have a city field directly. `Booking` has `city` field. `CustomerProfile` and `ProviderProfile` have address/lat/lng fields. **Decision**: Extract city from booking addresses and profile addresses; store city-level aggregations in snapshots.

6. **Operational alert thresholds**: No existing alert system in the codebase. **Decision**: Define configurable threshold-based alert detection that runs on a schedule and creates notifications via the existing NotificationsService.

### Findings Summary

See [research.md](research.md) for detailed findings.

## Phase 1 — Design & Contracts

### Data Model

See [data-model.md](data-model.md) for complete entity definitions, relationships, indexes, and constraints.

### Contracts

See [contracts/](contracts/) for:
- `contracts/README.md` — API contract overview
- API endpoint definitions with request/response shapes

### Quickstart

See [quickstart.md](quickstart.md) for implementation setup instructions, including entity creation, migration generation, module wiring, service implementation order, and job configuration.

## Complexity Tracking

*No constitution violations — Complexity Tracking section not required.*
