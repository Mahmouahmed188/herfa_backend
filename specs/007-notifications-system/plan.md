# Implementation Plan: Notifications System

**Branch**: `007-notifications-system` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/007-notifications-system/spec.md`

## Summary

Build a comprehensive event-driven notifications system. Enhance the existing notifications module to support automatic notification generation from platform events (bookings, reviews, payments, accounts), admin announcements with audience targeting, notification filtering/search, and an extensible channel interface for future delivery methods (push, email, SMS, WebSocket). A new announcement entity and module will be added alongside enhanced DTOs, event handlers, and Swagger documentation.

## Technical Context

**Language/Version**: TypeScript 5.3 / NestJS 10.4

**Primary Dependencies**: @nestjs/event-emitter (existing), class-validator, class-transformer, @nestjs/swagger, TypeORM, @prisma/client

**Storage**: PostgreSQL (existing — both TypeORM + Prisma)

**Testing**: Jest 29.7 (existing patterns in spec files)

**Target Platform**: Backend API (NestJS modules under `src/modules/`)

**Project Type**: Web-service — NestJS REST API with global prefix `api/v1`

**Performance Goals**: Notification list & unread count under 1s; event→notification delivery within 5s; support 1M notifications with pagination

**Constraints**: REST conventions, UUID primary keys, JWT auth, role-based guards, structured error responses, Swagger on every endpoint, dual ORM (TypeORM for entities, Prisma for auth)

**Scale/Scope**: Herfa Platform — Customer/Provider/Admin multi-tenant marketplace

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined? — Yes. Notifications entity exists. New notification_announcements entity needed. See [data-model.md](./data-model.md) in Phase 1.
- [x] P2: Clean Architecture followed (Controller → Service → Repository)? — Yes. Existing module follows this pattern; new code will too.
- [x] P3: Dedicated NestJS module planned? — Yes. Existing notifications module enhanced; announcements integrated within same module scope.
- [x] P4/P6: DTOs & Swagger decorators included? — Yes. Existing DTOs will be extended; new DTOs added for announcements and event handling.
- [x] P7/P8: JWT/Roles/Guards identified? — Yes. JwtAuthGuard already applied. RolesGuard for admin announcement endpoints.
- [x] P9: PostgreSQL UUIDs & Timestamps included? — Yes. Existing entity uses UUID PK and timestamps. New entity will too.
- [x] P10/P11: Structured Errors & Logging planned? — Yes. Global exception filter and NestJS Logger already in place.
- [x] P15: All 12 workflow steps accounted for? — Yes. Steps mapped in task generation.

## Complexity Tracking

No violations. The feature fits within the existing architecture without architectural overrides.

## Project Structure

### Documentation (this feature)

```text
specs/007-notifications-system/
  plan.md              # This file
  research.md          # Phase 0 output
  data-model.md        # Phase 1 output
  quickstart.md        # Phase 1 output
  contracts/           # Phase 1 output — notification channel interface contracts
  tasks.md             # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
  modules/
    notifications/
      notifications.module.ts         # Enhanced: registers event handlers, exports service
      notifications.controller.ts     # Enhanced: add PATCH /read-all, GET /unread-count, enhanced GET /
      notifications.service.ts        # Enhanced: add filtering, markAllAsRead, related entity support
      dto/
        notifications.dto.ts          # Enhanced: add type filter, date range, relatedEntity fields
        announcements.dto.ts          # NEW: CreateAnnouncementDto, AnnouncementResponseDto
      handlers/
        booking-events.handler.ts      # NEW: @OnEvent listeners for booking events
        review-events.handler.ts       # NEW: @OnEvent listeners for review events
        payment-events.handler.ts      # NEW: @OnEvent listeners for payment events
        account-events.handler.ts      # NEW: @OnEvent listeners for account events
      guards/
        announcement-ownership.guard.ts # NEW: admin-only guard for announcement management
  entities/
    notification.entity.ts             # Enhanced: add relatedEntityType, relatedEntityId fields
    notification-announcement.entity.ts # NEW: notification_announcements entity
  common/
    constants/
      user.enums.ts                    # Enhanced: update NotificationType enum
      notification.enums.ts            # NEW: NotificationTargetAudience enum
prisma/
  schema.prisma                        # Enhanced: add notification_announcements model, updated enum
```

**Structure Decision**: Single NestJS project — feature lives in the existing notifications module with new subdirectories for handlers and a new entity. This follows the existing module pattern (see `src/modules/`, `src/entities/`).
