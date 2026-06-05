# Research: Notifications System

## Notification Channel Interface

**Decision**: Define a `NotificationChannel` abstract class/interface with a single `send(notification, user)` method. The in-app channel is implemented immediately. Future channels (push, email, SMS, WebSocket) implement the same interface and register via DI.

**Rationale**: The `@nestjs/event-emitter` already fires `notification.created` events. A channel interface decouples delivery from generation. The NotificationsGateway (WebSocket) already exists but is unused — it should be wired in.

**Alternatives Considered**:
- Strategies pattern (same outcome, more ceremony)
- Direct service injection per channel (tight coupling, violates OCP)

## Enhanced Notification Entity

**Decision**: Add `relatedEntityType` (VARCHAR) and `relatedEntityId` (VARCHAR, nullable) columns to the existing TypeORM entity and Prisma model. Maintain backward compatibility by making them nullable. The existing `data` JSON column already stores extra metadata; `actionUrl` is retained.

**Rationale**: The spec requires related entity references. Adding explicit columns (rather than encoding in `data` JSON) enables efficient indexed lookups. Existing notifications will have null values in the new columns.

**Alternatives Considered**:
- Store everything in `data` JSON — loses indexability, violates spec
- New table — overkill for two nullable columns

## Announcement Entity

**Decision**: Create a new TypeORM entity (`NotificationAnnouncement`) and Prisma model (`notification_announcements`). Use TypeORM for runtime operations (matching the existing notification pattern) and Prisma for schema consistency.

**Rationale**: The existing NotificationsModule uses TypeORM exclusively. Adding a TypeORM entity keeps the pattern consistent. Prisma model is added for the dual-ORM schema record.

**Alternatives Considered**:
- Prisma-only — inconsistent with module pattern
- TypeORM-only — would break Prisma migration chain

## Notification Type Enum Update

**Decision**: Extend the existing `notifications_type_enum` in Prisma and the `NotificationType` TypeScript enum to match spec types:
- Booking (maps existing job_*, adds booking_*)
- Review (maps review_received)
- Payment (maps payment_received, payment_failed)
- Account (NEW)
- System (maps system, NEW for announcements)

**Rationale**: The spec defines 5 categories. The existing enum has granular types that can be grouped under these categories. Add the `type` field as the category and keep a sub-type in `data` JSON if granularity is needed, or extend the enum with more values.

## Event Handler Architecture

**Decision**: Create separate handler classes per domain (booking, review, payment, account), each using `@OnEvent()` decorator. Handlers receive events, construct notification payloads, and call `NotificationsService.create()`.

**Rationale**: Separation by domain follows the Single Responsibility Principle. Each handler maps specific events to notification content, keeping business logic out of the service.

**Alternatives Considered**:
- Single handler with switch statement — violates SRP, harder to test
- Event-to-notification mapping config — over-engineering for current scope

## Backward Compatibility

**Decision**: All existing notification endpoints, DTOs, and behavior are preserved. New features (filtering by type, date range) are additive via optional query parameters. The existing `markAsRead` DTO (accepts optional `notificationIds[]`) is retained; a dedicated `POST /mark-all-read` or `PATCH /read-all` endpoint is added.

**Rationale**: The existing implementation already serves in-production users. Breaking changes would require frontend updates and data migration.

## Summary of Key Decisions

| Decision | Choice | Impact |
|----------|--------|--------|
| Channel interface | Abstract class with `send()` | Extensible for push/email/SMS |
| Related entity | New nullable columns | Backward compatible, indexable |
| Announcement storage | TypeORM entity + Prisma model | Consistent with module pattern |
| Event handlers | Per-domain classes | SRP, testable |
| Notification types | Extended enum | Backward compatible |
| API changes | Additive only | No breaking changes |
