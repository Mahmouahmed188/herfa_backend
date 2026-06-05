# Implementation Plan: Support Tickets & Disputes System

**Branch**: `011-support-tickets-disputes` | **Date**: 2026-06-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/011-support-tickets-disputes/spec.md`

## Summary

Implement a Support Tickets & Disputes module for the Herfa Backend enabling customers and providers to create support tickets and booking-related disputes, with admin management, ticket messaging, evidence uploads, status workflows, audit logging, and notification integration. The module will follow the existing NestJS/TypeORM module pattern with dedicated entities, DTOs, services, controllers, guards, and Swagger documentation.

## Technical Context

**Language/Version**: NestJS / Node.js / TypeScript

**Primary Dependencies**: TypeORM, class-validator, class-transformer, @nestjs/swagger, @nestjs/typeorm

**Storage**: PostgreSQL (UUID primary keys) via TypeORM entities

**Testing**: Jest (Unit & Integration)

**Target Platform**: Backend API

**Project Type**: Web-service (NestJS Modules)

**Performance Goals**: Ticket/dispute list queries <500ms p95; message history <300ms p95

**Constraints**: REST conventions, UUIDs only, JWT auth, role-based guards, structured error responses

**Scale/Scope**: Herfa Platform (Customer/Provider Marketplace)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined? — YES, 4 entities specified (support_tickets, ticket_messages, disputes, dispute_evidence)
- [x] P2: Clean Architecture followed? — YES, Controller → Service → Repository pattern
- [x] P3: Dedicated NestJS module planned? — YES, dedicated `support` module
- [x] P4/P6: DTOs & Swagger decorators included? — YES, 13 DTOs defined with validation rules + Swagger requirement
- [x] P7/P8: JWT/Roles/Guards identified? — YES, Customer/Provider/Admin roles with ownership guards
- [x] P9: PostgreSQL UUIDs & Timestamps included? — YES, UUID PKs, createdAt/updatedAt on all entities
- [x] P10/P11: Structured Errors & Logging planned? — YES, structured error responses + NestJS Logger
- [x] P15: All 12 workflow steps accounted for? — YES, Analyze → Design → Migrate → DTOs → Module → Service → Controller → Guards → Swagger → Tests → Verify → Notes

**GATE Status**: ✅ PASS — All constitution principles satisfied. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/011-support-tickets-disputes/
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
│   ├── support-ticket.entity.ts         # NEW
│   ├── ticket-message.entity.ts         # NEW
│   ├── dispute.entity.ts                # NEW
│   └── dispute-evidence.entity.ts       # NEW
├── modules/
│   └── support/
│       ├── support.module.ts            # Module definition
│       ├── support.controller.ts        # Customer/Provider endpoints
│       ├── support.controller.spec.ts
│       ├── admin-support.controller.ts  # Admin endpoints
│       ├── admin-support.controller.spec.ts
│       ├── services/
│       │   ├── tickets.service.ts
│       │   ├── tickets.service.spec.ts
│       │   ├── disputes.service.ts
│       │   ├── disputes.service.spec.ts
│       │   ├── ticket-messages.service.ts
│       │   ├── ticket-messages.service.spec.ts
│       │   └── dispute-evidence.service.ts
│       ├── guards/
│       │   ├── ticket-ownership.guard.ts
│       │   └── dispute-participant.guard.ts
│       ├── dto/
│       │   ├── create-ticket.dto.ts
│       │   ├── ticket-response.dto.ts
│       │   ├── create-ticket-message.dto.ts
│       │   ├── ticket-message-response.dto.ts
│       │   ├── create-dispute.dto.ts
│       │   ├── dispute-response.dto.ts
│       │   ├── create-dispute-evidence.dto.ts
│       │   ├── dispute-evidence-response.dto.ts
│       │   ├── update-ticket-status.dto.ts
│       │   ├── update-dispute-status.dto.ts
│       │   ├── resolve-dispute.dto.ts
│       │   ├── ticket-filter.dto.ts
│       │   └── dispute-filter.dto.ts
│       └── enums/
│           ├── ticket-category.enum.ts
│           ├── ticket-status.enum.ts
│           ├── ticket-priority.enum.ts
│           ├── dispute-status.enum.ts
│           └── evidence-file-type.enum.ts
├── common/
│   └── interfaces/
│       └── storage-provider.interface.ts  # EXISTING — reuse for evidence
└── seeds/
    └── support-categories.seed.ts         # Optional seed data
```

**Structure Decision**: Single NestJS backend project with dedicated `support` module under `src/modules/`. Entities stored in `src/entities/` following the existing pattern. Reuses existing `StorageProvider` interface from `src/common/interfaces/` and existing `AuditLog` entity pattern.

## Phase 0 — Research

*No [NEEDS CLARIFICATION] markers found in spec. Research focuses on confirming existing patterns.*

### Research Tasks

1. **Existing storage provider interface**: Located at `src/common/interfaces/storage-provider.interface.ts` — defines `upload(file, path?)`, `delete(path)`, `getUrl(path)`. Concrete implementation at `src/modules/provider-verification/services/local-storage-provider.service.ts` using multer disk storage. **Decision**: Reuse this interface for evidence file uploads.

2. **Existing audit logging pattern**: `AuditLog` entity at `src/entities/audit-log.entity.ts` with columns: `id` (uuid), `action`, `entityType`, `entityId`, `actorId`, `actorRole`, `metadata` (JSON), `createdAt`. Indexed on `[entityType, entityId]`, `[actorId]`, `[action]`, `[createdAt]`. **Decision**: Register `AuditLog` in the support module's `TypeOrmModule.forFeature()` and create a local `AuditService` (following the existing per-module pattern) to log support-related actions.

3. **Existing notification event pattern**: Notifications module at `src/modules/notifications/handlers/` has event-driven handlers (account-events.handler, booking-events.handler, payment-events.handler, review-events.handler, verification-events.handler). **Decision**: Create a `support-events.handler.ts` following the same pattern to handle ticket/dispute notification events.

4. **TypeORM entity pattern**: All entities use `@Entity()`, `@PrimaryGeneratedColumn('uuid')`, `@CreateDateColumn()`, `@UpdateDateColumn()`, and explicit relation decorators (`@ManyToOne`, `@OneToMany`). **Decision**: Follow this exact pattern for new entities.

### Findings Summary (research.md)

See [research.md](research.md) for detailed findings.

## Phase 1 — Design & Contracts

### Data Model

See [data-model.md](data-model.md) for complete entity definitions, relationships, indexes, and constraints.

### Contracts

See [contracts/](contracts/) for:
- `contracts/README.md` — API contract overview
- API endpoint definitions with request/response shapes

### Quickstart

See [quickstart.md](quickstart.md) for implementation setup instructions, including entity creation, migration generation, and module wiring.

## Complexity Tracking

*No constitution violations — Complexity Tracking section not required.*
