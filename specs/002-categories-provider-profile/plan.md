# Implementation Plan: Categories & Provider Profiles

**Branch**: `002-categories-provider-profile` | **Date**: 2026-06-05 | **Spec**: [specs/002-categories-provider-profile/spec.md](spec.md)

**Input**: Feature specification from `/specs/002-categories-provider-profile/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Design and implement the Categories system and Provider Profile layer for the Herfa platform. This includes defining the database schema for categories and professional profiles, establishing a many-to-many relationship between them, and providing APIs for Admin management, Provider self-service, and Customer discovery. The implementation will leverage Prisma ORM and follow NestJS best practices.

## Technical Context

**Language/Version**: NestJS / Node.js

**Primary Dependencies**: Prisma ORM, @nestjs/swagger, class-validator, class-transformer

**Storage**: PostgreSQL (UUID primary keys)

**Testing**: Jest (Unit & Integration)

**Target Platform**: Backend API

**Project Type**: Web-service (NestJS Modules)

**Performance Goals**: Category CRUD < 300ms, Provider listing < 500ms for 10k records.

**Constraints**: REST conventions, UUIDs only, Many-to-Many via join table.

**Scale/Scope**: Marketplace core classification and professional identity system.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined? (See data-model.md)
- [x] P2: Clean Architecture followed (Controller -> Service -> Repository)?
- [x] P3: Dedicated NestJS module planned? (CategoriesModule, ProvidersModule)
- [x] P4/P6: DTOs & Swagger decorators included? (See contracts/)
- [x] P7/P8: JWT/Roles/Guards identified? (See research.md)
- [x] P9: PostgreSQL UUIDs & Timestamps included? (See data-model.md)
- [x] P10/P11: Structured Errors & Logging planned?
- [x] P15: All 12 workflow steps accounted for? (Integrated into tasks.md)

## Project Structure

### Documentation (this feature)

```text
specs/002-categories-provider-profile/
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
│   ├── categories/
│   │   ├── dto/
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── categories.module.ts
│   └── providers/
│       ├── dto/
│       ├── providers.controller.ts
│       ├── providers.service.ts
│       └── providers.module.ts
└── prisma/
    └── schema.prisma
```

**Structure Decision**: Two new modules, `CategoriesModule` and `ProvidersModule`, following the standard NestJS architecture. The existing `PrismaModule` will be used for persistence.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
