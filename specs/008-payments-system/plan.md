# Implementation Plan: Payments System

**Branch**: `008-payments-system` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/008-payments-system/spec.md`

## Summary

Implement a comprehensive Payments System for Herfa that manages all financial transactions related to bookings. The system covers payment creation (auto-generated per booking), payment status lifecycle (pending → authorized → paid → failed/refunded/partially_refunded/cancelled), refund management (full and partial), role-based access (customer view, provider view, admin management), search/filter/pagination, audit logging, and notification integration. Architecture includes abstraction interfaces for future payment gateway integrations (Stripe, Paymob, Fawry, etc.) while supporting current methods (Cash, Credit Card, Debit Card, Wallet). The feature builds on existing Booking, Auth, Users, and Notifications modules.

## Technical Context

**Language/Version**: NestJS / Node.js

**Primary Dependencies**: TypeORM, Prisma, class-validator, class-transformer, @nestjs/swagger, @nestjs/event-emitter

**Storage**: PostgreSQL (UUID primary keys)

**Testing**: Jest (Unit & Integration)

**Target Platform**: Backend API

**Project Type**: Web-service (NestJS Modules) — dual ORM (TypeORM entities + Prisma schema)

**Performance Goals**: Query pagination <1s for up to 10,000 payments; Status transitions <1s; Refund processing <2s

**Constraints**: REST conventions, UUIDs only, existing JWT auth, role-based access (customer/provider/admin)

**Scale/Scope**: Herfa Platform (Customer/Provider Marketplace) — depends on Auth, Users, Booking, Notifications modules

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined (existing `payments` table + new `refunds` table in schema.prisma + TypeORM entities)
- [x] P2: Clean Architecture followed (Controller -> Service -> Repository/Prisma)
- [x] P3: Dedicated NestJS module planned (existing `PaymentsModule` in `src/modules/payments/`)
- [x] P4/P6: DTOs & Swagger decorators included
- [x] P7/P8: JWT/Roles/Guards identified (existing `JwtAuthGuard`, `RolesGuard` in `src/common/guards/`)
- [x] P9: PostgreSQL UUIDs & Timestamps included (TypeORM `@PrimaryGeneratedColumn('uuid')`, `@CreateDateColumn`, `@UpdateDateColumn`)
- [x] P10/P11: Structured Errors & Logging planned (custom exception filters + NestJS Logger)
- [x] P15: All 12 workflow steps accounted for (Analyze → Design Entities → Migrations → DTOs → Module → Service → Controller → Guards → Swagger → Tests → Verify → Integration Notes)

## Project Structure

### Documentation (this feature)

```text
specs/008-payments-system/
├── plan.md              # This file (/speckit.plan command output)
├── spec.md              # Feature specification
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── entities/
│   ├── payment.entity.ts        # UPDATE: add paymentNumber, currency, transactionReference, notes; remove platformFee, providerPayout, stripe fields; link to Booking not Job
│   ├── refund.entity.ts          # CREATE: new TypeORM entity for Refund
│   ├── booking.entity.ts         # EXISTING: add OneToMany for payments relation
│   └── ... (existing entities)
├── common/
│   ├── constants/
│   │   ├── user.enums.ts         # UPDATE: PaymentStatus enum with new values (AUTHORIZED, PARTIALLY_REFUNDED, CANCELLED)
│   │   └── payment.enums.ts      # CREATE: new enums for PaymentMethod, PaymentStatusTransition
│   ├── guards/
│   │   ├── jwt-auth.guard.ts     # EXISTING: reused
│   │   └── roles.guard.ts        # EXISTING: reused
│   ├── dto/
│   │   └── pagination.dto.ts     # EXISTING or CREATE: reusable pagination DTO
│   └── interfaces/
│       └── payment-gateway.interface.ts  # CREATE: abstraction for future payment gateway integrations
├── modules/
│   ├── payments/
│   │   ├── payments.module.ts     # UPDATE: enhanced module with new controllers/services
│   │   ├── payments.controller.ts # UPDATE: customer endpoints (GET /payments, GET /payments/:id)
│   │   ├── payments.service.ts    # UPDATE: create/list/filter payments
│   │   ├── payments-admin.controller.ts  # CREATE: admin endpoints
│   │   ├── payments-admin.service.ts      # CREATE: admin logic (status update, refund)
│   │   ├── payments-provider.controller.ts # CREATE: provider endpoints
│   │   ├── dto/
│   │   │   ├── create-payment.dto.ts       # CREATE
│   │   │   ├── payment-response.dto.ts     # CREATE
│   │   │   ├── payment-filter.dto.ts       # CREATE: filter/pagination/search params
│   │   │   ├── update-payment-status.dto.ts # CREATE
│   │   │   └── refund-request.dto.ts       # CREATE
│   │   ├── guards/
│   │   │   └── payment-owner.guard.ts      # CREATE: verify customer/provider ownership
│   │   └── enums/
│   │       └── payment-status.enum.ts      # CREATE: status constants with transition validation
│   └── refunds/
│       ├── refunds.module.ts      # CREATE
│       ├── refunds.service.ts     # CREATE
│       └── dto/
│           └── refund-response.dto.ts # CREATE
├── prisma/
│   └── schema.prisma             # UPDATE: add refunds model, update payments model
├── test/
│   └── unit/
│       └── payments/             # Tests for payments module
│       └── refunds/              # Tests for refunds module
```

**Structure Decision**: Single NestJS backend project. The Payments System extends the existing `payments` module under `src/modules/payments/` and adds a new `refunds` module. TypeORM entities in `src/entities/` for runtime ORM, Prisma schema for migrations and type generation.

## Complexity Tracking

No constitution violations identified — this feature follows all established patterns.

---

## Phase 0: Research

The following items need investigation before detailed design:

1. **Payment status transition matrix** — define all valid and invalid transitions
2. **Payment number generation strategy** — determine format (e.g., "PAY-" prefix + timestamp/sequence)
3. **Audit logging approach** — determine whether to use database audit table or NestJS Logger with structured format
4. **Event-driven notification integration pattern** — determine how to emit events from payments module to notifications module
5. **Payment gateway abstraction layer design** — design the provider interface pattern

These will be resolved in [research.md](./research.md).

## Phase 1: Design

Artifacts to generate after research is complete:
- [data-model.md](./data-model.md) — entity definitions, relationships, validation rules, indexes
- [contracts/](./contracts/) — API contract documentation with request/response schemas
- [quickstart.md](./quickstart.md) — developer setup guide for the payments module
- Update agent context in AGENTS.md
