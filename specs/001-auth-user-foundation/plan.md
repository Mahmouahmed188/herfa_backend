# Implementation Plan: Authentication and User Foundation

**Branch**: `001-auth-user-foundation` | **Date**: 2026-06-05 | **Spec**: [specs/001-auth-user-foundation/spec.md](spec.md)

**Input**: Feature specification from `/specs/001-auth-user-foundation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement the foundational authentication and user management system for the Herfa platform. The approach involves creating two core NestJS modules: `AuthModule` (for JWT, Passport, and session management) and `UsersModule` (for profile management and persistence via Prisma). Authentication will use a dual-token strategy (Access + Refresh) and passwords will be hashed with Bcrypt.

## Technical Context

**Language/Version**: NestJS / Node.js

**Primary Dependencies**: Prisma ORM, @nestjs/passport, passport-jwt, bcrypt, class-validator, class-transformer, @nestjs/swagger

**Storage**: PostgreSQL (UUID primary keys)

**Testing**: Jest (Unit & Integration)

**Target Platform**: Backend API

**Project Type**: Web-service (NestJS Modules)

**Performance Goals**: <500ms for auth requests (Login/Refresh), <200ms for profile retrieval.

**Constraints**: REST conventions, UUIDs only, Bcrypt hashing, RBAC (Customer, Provider, Admin).

**Scale/Scope**: Herfa Platform (Customer/Provider Marketplace)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined? (See data-model.md)
- [x] P2: Clean Architecture followed (Controller -> Service -> Repository)?
- [x] P3: Dedicated NestJS module planned? (AuthModule, UsersModule)
- [x] P4/P6: DTOs & Swagger decorators included? (See contracts/)
- [x] P7/P8: JWT/Roles/Guards identified? (See research.md)
- [x] P9: PostgreSQL UUIDs & Timestamps included? (See data-model.md)
- [x] P10/P11: Structured Errors & Logging planned?
- [x] P15: All 12 workflow steps accounted for? (Integrated into tasks.md)

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-user-foundation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── modules/
│   ├── auth/
│   │   ├── dto/
│   │   ├── strategies/
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   └── users/
│       ├── dto/
│       ├── users.controller.ts
│       ├── users.service.ts
│       └── users.module.ts
├── common/
│   ├── decorators/
│   ├── guards/
│   └── filters/
└── prisma/
    └── schema.prisma

test/
├── auth/
└── users/
```

**Structure Decision**: Standard NestJS module-based structure as per Constitution P3. Modules are self-contained with DTOs, controllers, and services.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
