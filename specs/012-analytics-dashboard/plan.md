# Implementation Plan: Admin Dashboard & Analytics System

**Branch**: `012-analytics-dashboard` | **Date**: 2026-06-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/012-analytics-dashboard/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Build a dedicated NestJS `AnalyticsModule` providing admin dashboard overview, user/provider/booking/revenue/review/support/geographic analytics, pre-computed snapshots via Bull queues, report generation with CSV/Excel export, admin activity logging, and operational alert detection. All endpoints secured with JWT + admin role guards, reusing existing Auth infrastructure.

## Technical Context

**Language/Version**: NestJS 10.3 / Node.js (TypeScript)

**Primary Dependencies**: TypeORM 0.3, class-validator, class-transformer, @nestjs/swagger 7.3, @nestjs/bull 10.1, bull 4.12, exceljs

**Storage**: PostgreSQL (UUID primary keys, JSONB for snapshot data)

**Testing**: Jest (Unit & Integration)

**Target Platform**: Backend API (`/api/v1/admin/dashboard/*`, `/api/v1/admin/reports/*`, `/api/v1/admin/activity-logs`)

**Project Type**: Web-service (NestJS Modules) — both TypeORM and Prisma in use

**Performance Goals**: Dashboard overview <2s p95; analytics endpoints <3s p95 with 100k+ source records; snapshot generation <5min for 500k users; CSV export of 10k rows <10s

**Constraints**: REST conventions, UUIDs only, JWT auth, admin role enforcement, snapshot-first with real-time fallback, immutable activity log

**Scale/Scope**: Herfa Platform (Customer/Provider Marketplace) — target up to 500k users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined (AnalyticsSnapshot, AdminActivityLog entities in data-model.md)
- [x] P2: Clean Architecture followed (Controller -> Service -> Repository pattern)
- [x] P3: Dedicated AnalyticsModule planned (not extending existing admin module)
- [x] P4/P6: DTOs & Swagger decorators included (12 DTOs defined in quickstart.md)
- [x] P7/P8: JWT/Roles/Guards identified (reuse JwtAuthGuard + RolesGuard with ADMIN/SUPER_ADMIN)
- [x] P9: PostgreSQL UUIDs & Timestamps included (both entities use UUID PK + timestamps)
- [x] P10/P11: Structured Errors & Error codes defined; logging via NestJS Logger + ActivityLog
- [x] P15: All 12 workflow steps accounted for (entities → migration → DTOs → module → services → controllers → guards → queues → Swagger → tests → wiring)

**No violations — all gates pass.**

## Project Structure

### Documentation (this feature)

```text
specs/012-analytics-dashboard/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — codebase research and decisions
├── data-model.md        # Phase 1 output — entities, relationships, constraints
├── quickstart.md        # Phase 1 output — 12-step implementation order
├── contracts/           # Phase 1 output — API contracts (README.md)
│   └── README.md
├── checklists/          # Phase 2 output
│   └── requirements.md
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── entities/
│   ├── analytics-snapshot.entity.ts    # NEW — pre-computed aggregation results
│   └── admin-activity-log.entity.ts    # NEW — immutable admin audit trail
│
├── modules/
│   └── analytics/                      # NEW — dedicated NestJS module
│       ├── analytics.module.ts
│       ├── analytics.controller.ts     # Dashboard + analytics endpoints
│       ├── reports.controller.ts       # Report generation + export endpoints
│       ├── activity-logs.controller.ts # Activity log listing endpoint
│       ├── enums/
│       │   └── admin-action.enum.ts
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
│       ├── services/
│       │   ├── activity-log.service.ts
│       │   ├── user-analytics.service.ts
│       │   ├── provider-analytics.service.ts
│       │   ├── booking-analytics.service.ts
│       │   ├── revenue-analytics.service.ts
│       │   ├── review-analytics.service.ts
│       │   ├── support-analytics.service.ts
│       │   ├── geographic-analytics.service.ts
│       │   ├── alert.service.ts
│       │   ├── analytics-snapshot.service.ts
│       │   ├── report.service.ts
│       │   └── dashboard.service.ts
│       └── jobs/
│           ├── analytics-snapshot.job.ts    # Repeatable Bull processor
│           └── alert-detection.job.ts       # Periodic Bull processor
│
└── app.module.ts                           # MODIFIED — add AnalyticsModule
```

**Structure Decision**: Dedicated `analytics` module under `src/modules/` following the established NestJS module pattern. New entities in `src/entities/` alongside existing entities. New controllers mirroring the existing admin controller pattern (`@UseGuards(JwtAuthGuard, RolesGuard)` with `@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)`).

## Complexity Tracking

> No violations — all Constitution gates pass. No complexity justification needed.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
