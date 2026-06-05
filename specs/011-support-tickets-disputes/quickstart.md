# Quickstart: Support Tickets & Disputes System

**Phase**: 1 | **Date**: 2026-06-05

## Prerequisites

- NestJS project with TypeORM configured
- Existing entities: `User`, `Booking`, `AuditLog`
- Existing modules: Auth, Users, Bookings, Notifications
- Existing `StorageProvider` interface at `src/common/interfaces/storage-provider.interface.ts`

## Implementation Order

### Step 1: Create Entities

Create 4 new entity files in `src/entities/`:

1. `support-ticket.entity.ts` — SupportTicket entity
2. `ticket-message.entity.ts` — TicketMessage entity
3. `dispute.entity.ts` — Dispute entity
4. `dispute-evidence.entity.ts` — DisputeEvidence entity

Follow existing entity conventions:
- `@Entity('snake_case_table_name')`
- `@PrimaryGeneratedColumn('uuid')`
- `@CreateDateColumn()` / `@UpdateDateColumn()`
- `@ManyToOne` / `@OneToMany` for relationships
- Foreign key columns with `@JoinColumn()`

### Step 2: Create Enums

Create enum files in `src/modules/support/enums/`:

- `ticket-category.enum.ts`: Technical, Booking, Payment, Account, Verification, General
- `ticket-status.enum.ts`: open, in_progress, waiting_for_user, resolved, closed
- `ticket-priority.enum.ts`: low, medium, high, urgent
- `dispute-status.enum.ts`: open, under_review, awaiting_evidence, resolved_customer, resolved_provider, closed

### Step 3: Generate Migration

Run TypeORM migration generation to create `support_tickets`, `ticket_messages`, `disputes`, `dispute_evidence` tables with all indexes.

### Step 4: Create DTOs

Create DTO files in `src/modules/support/dto/` with class-validator decorators and Swagger decorators:

- `create-ticket.dto.ts`
- `ticket-response.dto.ts`
- `create-ticket-message.dto.ts`
- `ticket-message-response.dto.ts`
- `create-dispute.dto.ts`
- `dispute-response.dto.ts`
- `create-dispute-evidence.dto.ts`
- `dispute-evidence-response.dto.ts`
- `update-ticket-status.dto.ts`
- `update-dispute-status.dto.ts`
- `resolve-dispute.dto.ts`
- `ticket-filter.dto.ts`
- `dispute-filter.dto.ts`

### Step 5: Create Module

Create `support.module.ts` registering all entities, services, controllers, and importing required modules (TypeOrm, Auth, Bookings, Notifications, Uploads).

### Step 6: Create Services

Create services in `src/modules/support/services/`:

- `tickets.service.ts` — CRUD, status transitions, search/filter
- `ticket-messages.service.ts` — message creation, conversation loading
- `disputes.service.ts` — CRUD, status transitions, resolution
- `dispute-evidence.service.ts` — file validation, storage integration

### Step 7: Create Controllers

- `support.controller.ts` — Customer/Provider endpoints
- `admin-support.controller.ts` — Admin endpoints

### Step 8: Create Guards

- `ticket-ownership.guard.ts` — Ensures user owns the ticket (for customer/provider)
- `dispute-participant.guard.ts` — Ensures user is participant in the dispute

### Step 9: Add Swagger Decorators

Add `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`, `@ApiQuery`, `@ApiConsumes` to all endpoints.

### Step 10: Create Tests

- Unit tests for all services
- Unit tests for controllers
- Unit tests for guards

### Step 11: Create Notification Handler

Create `src/modules/notifications/handlers/support-events.handler.ts` to listen and dispatch notification events for:
- Ticket Created
- Ticket Updated (status/priority change)
- New Message Added
- Dispute Opened
- Dispute Resolved
- Ticket Closed

### Step 12: Wire in App Module

Add `SupportModule` to `app.module.ts` imports.

## Key Integration Points

| Integration | Details |
|-------------|---------|
| Auth Module | JWT guard for all endpoints; user identity from request |
| Booking Module | Validate booking existence and participant involvement |
| Notifications Module | Event-driven handlers for support events |
| Storage Provider | Reuse `StorageProvider` interface for evidence file storage |
| Audit Log | Register `AuditLog` entity; log status changes, priority changes, resolutions, evidence uploads |
