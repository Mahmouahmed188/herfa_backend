# Implementation Plan: Reviews & Ratings System

**Branch**: `005-reviews-ratings-system` | **Date**: 2026-06-05 | **Spec**: [specs/005-reviews-ratings-system/spec.md](specs/005-reviews-ratings-system/spec.md)

**Input**: Feature specification from `specs/005-reviews-ratings-system/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Customers rate and review providers after completed service bookings. System enforces one review per booking, auto-calculates provider rating stats (avg, total, per-star distribution), supports public/anonymous viewing, provider dashboard, admin moderation with audit logging, and customer edit/delete within 24-hour window. Extends existing `reviews` module with booking-based reviews, `ProviderRatingStats` aggregate entity, role-separated controllers, full DTOs with validation, event-driven stats recalculation, and audit logging.

## Technical Context

**Language/Version**: NestJS 10 / Node.js 20

**Primary Dependencies**: TypeORM 0.3, class-validator, class-transformer, @nestjs/swagger 7, @nestjs/event-emitter

**Storage**: PostgreSQL (UUID primary keys) — dev uses SQLite via better-sqlite3

**Testing**: Jest (Unit & Integration via supertest)

**Target Platform**: Backend API (NestJS)

**Project Type**: Web-service (feature-as-NestJS-module)

**Performance Goals**: SC-002: Stats update <2s; SC-003: Public reviews page <1s for 10k reviews; SC-004: Admin moderation <1s

**Constraints**: REST conventions, UUIDs only, JWT Bearer auth, structured error responses

**Scale/Scope**: Herfa Platform — Customer/Provider/Admin roles, marketplace context

**Known Dependencies**:
- **NEEDS CLARIFICATION**: Existing `Review` entity uses `jobId` — spec requires `bookingId`. Decision: extend entity or migrate? Options: (a) Add `bookingId` alongside `jobId`, (b) Replace `jobId` with `bookingId`, (c) Keep both for backward compat.
- **NEEDS CLARIFICATION**: Existing `ProviderProfile.rating` (simple decimal) vs spec `ProviderRatingStats` entity. Decision: add new entity and optionally deprecate `rating` on profile.
- **NEEDS CLARIFICATION**: Existing `ReviewsService` uses raw SQL for rating update — spec requires optimized aggregation. Best approach: TypeORM query builder with subquery vs raw SQL.
- **NEEDS CLARIFICATION**: Event emission pattern — spec FR-020 requires events for review create/update/admin-remove. Confirm existing `EventEmitter2` usage pattern from Bookings module.
- **NEEDS CLARIFICATION**: Admin moderation audit logging — should use existing `BookingStatusHistory`-style pattern or create dedicated `ModerationLog` entity?

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined? — 3 entities designed: Review (extended), ProviderRatingStats (new), ModerationLog (new)
- [x] P2: Clean Architecture followed (Controller -> Service -> Repository)? — TypeORM repository pattern throughout
- [x] P3: Dedicated NestJS module planned? — `src/modules/reviews/` exists and is registered in AppModule
- [x] P4/P6: DTOs & Swagger decorators included? — 6 DTOs with class-validator + @nestjs/swagger defined in contracts/
- [x] P7/P8: JWT/Roles/Guards identified? — JwtAuthGuard, RolesGuard, custom ReviewOwnershipGuard
- [x] P9: PostgreSQL UUIDs & Timestamps included? — uuid PKs, createdAt/updatedAt on all entities
- [x] P10/P11: Structured Errors & Logging planned? — Global AllExceptionsFilter + NestJS Logger in service
- [x] P15: All 12 workflow steps accounted for? — All 12 steps mapped (implementation in tasks.md)

## Project Structure

### Documentation (this feature)

```text
specs/005-reviews-ratings-system/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
# Single NestJS project (currently active — all backend code in src/)
src/
├── entities/
│   ├── review.entity.ts              # EXTEND: add bookingId, editableUntil, moderation fields
│   └── provider-rating-stats.entity.ts  # NEW: cached aggregate stats
├── modules/
│   └── reviews/
│       ├── reviews.module.ts         # EXTEND: import ProviderRatingStats entity + BookingsModule
│       ├── reviews.controller.ts     # REWRITE: split into customer/provider/admin controllers
│       ├── reviews.service.ts        # REWRITE: full business logic + event emission + stats
│       ├── dto/
│       │   ├── create-review.dto.ts       # NEW
│       │   ├── update-review.dto.ts       # NEW
│       │   ├── review-response.dto.ts     # NEW
│       │   ├── review-filter.dto.ts       # NEW
│       │   └── provider-rating-stats-response.dto.ts  # NEW
│       ├── guards/
│       │   └── review-ownership.guard.ts  # NEW: ownership + time-window check
│       └── events/
│           └── review.events.ts           # NEW: event payload types
└── common/
    ├── constants/
    │   └── user.enums.ts              # EXTEND: add ReviewSortBy enum if needed
    └── dto/
        └── pagination.dto.ts          # REUSE: PaginationDto as base for ReviewFilterDto

tests/ (in root or src/)
├── unit/
│   ├── reviews.service.spec.ts
│   └── review-ownership.guard.spec.ts
└── integration/
    └── reviews.controller.spec.ts
```

**Structure Decision**: Single NestJS backend project with feature module in `src/modules/reviews/`, entities in `src/entities/`, shared infrastructure in `src/common/`. This follows the existing codebase conventions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations — design follows existing conventions exactly.
