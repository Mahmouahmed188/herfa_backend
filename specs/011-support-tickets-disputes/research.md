# Research: Support Tickets & Disputes System

**Phase**: 0 | **Date**: 2026-06-05

## Overview

No [NEEDS CLARIFICATION] markers exist in the spec. This research confirms existing codebase patterns to maintain consistency.

## 1. Storage Provider Interface

- **Location**: `src/common/interfaces/storage-provider.interface.ts`
- **Interface**: `StorageProvider` with methods `upload(file, path?)`, `delete(path)`, `getUrl(path)`
- **Concrete impl**: `src/modules/provider-verification/services/local-storage-provider.service.ts` (multer disk storage)
- **Decision**: Reuse this interface for dispute evidence uploads. The existing abstraction supports adding S3, R2, or Supabase providers without changing the evidence service.

## 2. Audit Logging Pattern

- **Entity**: `src/entities/audit-log.entity.ts` — `AuditLog` with columns: `id` (uuid), `action` (varchar), `entityType` (varchar), `entityId` (uuid), `actorId` (uuid), `actorRole` (varchar), `metadata` (jsonb), `createdAt` (timestamp)
- **Indexes**: `[entityType, entityId]`, `[actorId]`, `[action]`, `[createdAt]`
- **Usage**: Each module creates its own `AuditService` and registers `AuditLog` via `TypeOrmModule.forFeature([AuditLog])`
- **Decision**: Create `AuditService` within the support module following the same pattern. Audit entries for: ticket status changes, priority changes, dispute status changes, dispute resolutions, and evidence uploads.

## 3. Notification Event Pattern

- **Location**: `src/modules/notifications/handlers/`
- **Handlers**: account-events.handler.ts, booking-events.handler.ts, payment-events.handler.ts, review-events.handler.ts, verification-events.handler.ts
- **Pattern**: Each handler listens for domain events and creates notifications via `NotificationsService`
- **Events to handle**: TicketCreated, TicketUpdated, TicketMessageAdded, DisputeOpened, DisputeResolved, TicketClosed
- **Decision**: Create `support-events.handler.ts` emitting events from the support service and handling them in the notifications module.

## 4. TypeORM Entity Conventions

- **Decorators**: `@Entity('table_name')`, `@PrimaryGeneratedColumn('uuid')`, `@CreateDateColumn()`, `@UpdateDateColumn()`
- **Relations**: `@ManyToOne(() => RelatedEntity)`, `@JoinColumn({ name: 'related_id' })`, `@OneToMany(() => ChildEntity, child => child.parent)`
- **Naming**: snake_case for columns and table names
- **Decision**: Follow all existing conventions exactly.

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Storage interface | Reuse existing `StorageProvider` interface | Consistent pattern; supports multiple providers |
| Audit logging | Per-module `AuditService` + shared `AuditLog` entity | Follows existing pattern; avoids refactoring |
| Notification integration | `support-events.handler.ts` in notifications module | Consistent with existing handler pattern |
| ORM | TypeORM (existing) | Project-wide standard |
| File validation | Multer with file type/size filters | Existing pattern in local-storage-provider.service |
