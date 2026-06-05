# Implementation Plan: Provider Verification System

**Branch**: `009-provider-verification` | **Date**: 2026-06-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/009-provider-verification/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

Implement a Provider Verification System that manages the onboarding, verification, approval, rejection, and suspension of service providers. The module handles document uploads, admin review workflows, immutable audit trails, and notification integration. Only verified (approved) providers appear in search results and receive bookings.

## Technical Context

**Language/Version**: NestJS / Node.js (TypeScript)

**Primary Dependencies**: @nestjs/common, @nestjs/typeorm, typeorm, pg, class-validator, class-transformer, @nestjs/swagger, @nestjs/jwt, @nestjs/passport, multer, @nestjs/event-emitter, uuid

**Storage**: PostgreSQL with TypeORM (UUID primary keys)

**Testing**: Jest (Unit), Supertest (E2E)

**Target Platform**: Backend API

**Project Type**: Web-service (NestJS Modules)

**Performance Goals**: Status checks <200ms p95, document retrieval <500ms p95, admin listing <300ms p95

**Constraints**: REST conventions, UUIDs only, role-based access, JWT auth, structured error responses, global response wrapper

**Scale/Scope**: Herfa Platform (Customer/Provider Marketplace)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined? — Yes. Entities: ProviderVerification, VerificationDocument, VerificationHistory with full relationships, indexes, and constraints.
- [x] P2: Clean Architecture followed (Controller -> Service -> Repository)? — Yes. Thin controllers, business logic in services, repository pattern via TypeORM.
- [x] P3: Dedicated NestJS module planned? — Yes. New `provider-verification` module with sub-services for documents, history, and audit.
- [x] P4/P6: DTOs & Swagger decorators included? — Yes. 9+ DTOs with class-validator rules and @ApiProperty decorators on every endpoint.
- [x] P7/P8: JWT/Roles/Guards identified? — Yes. JwtAuthGuard globally, RolesGuard for admin endpoints, custom ownership guard for provider data access.
- [x] P9: PostgreSQL UUIDs & Timestamps included? — Yes. UUID primary keys, createdAt/updatedAt on all entities.
- [x] P10/P11: Structured Errors & Logging planned? — Yes. Reuse global AllExceptionsFilter; dedicated AuditService for verification action logging.
- [x] P15: All 12 workflow steps accounted for? — Yes. Analyze → Design entities → Generate migration → DTOs → Module → Service → Controller → Guards → Swagger → Tests → Verify contracts → Integration notes.

## Project Structure

### Documentation (this feature)

```text
specs/009-provider-verification/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── provider-verification-contract.md
├── checklists/
│   └── requirements.md
└── tasks.md             # Phase 2 output (not created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── entities/
│   ├── provider-verification.entity.ts
│   ├── verification-document.entity.ts
│   └── verification-history.entity.ts
├── modules/
│   └── provider-verification/
│       ├── provider-verification.module.ts
│       ├── provider-verification.controller.ts
│       ├── provider-verification-admin.controller.ts
│       ├── provider-verification.service.ts
│       ├── provider-verification-admin.service.ts
│       ├── dto/
│       │   ├── submit-verification.dto.ts
│       │   ├── verification-status-response.dto.ts
│       │   ├── verification-documents-response.dto.ts
│       │   ├── upload-document.dto.ts
│       │   ├── admin-verification-filter.dto.ts
│       │   ├── admin-verification-response.dto.ts
│       │   ├── approve-verification.dto.ts
│       │   ├── reject-verification.dto.ts
│       │   └── suspend-reactivate.dto.ts
│       ├── guards/
│       │   └── verification-owner.guard.ts
│       └── services/
│           ├── document.service.ts
│           ├── history.service.ts
│           └── audit.service.ts
└── common/
    └── interfaces/
        └── storage-provider.interface.ts

test/
├── unit/
│   └── provider-verification/
│       ├── provider-verification.service.spec.ts
│       ├── provider-verification-admin.service.spec.ts
│       ├── document.service.spec.ts
│       ├── history.service.spec.ts
│       └── audit.service.spec.ts
└── integration/
    └── provider-verification.e2e-spec.ts

prisma/
└── schema.prisma          # Updated with verification models
```

**Structure Decision**: The standard Herfa NestJS module pattern with separate controllers for provider and admin roles, dedicated sub-services for cross-cutting concerns (documents, history, audit), and a feature-specific ownership guard.

## Complexity Tracking

*No Constitution violations identified — standard patterns followed throughout.*

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
