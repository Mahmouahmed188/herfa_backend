# Implementation Plan: Categories & Provider Profiles

**Branch**: `002-categories-provider-profile` | **Date**: 2026-06-05 | **Spec**: `specs/002-categories-provider-profile/spec.md`

**Input**: Feature specification from `specs/002-categories-provider-profile/spec.md`

## Summary

Enhance the Herfa marketplace with formalized service category management (Admin CRUD), provider professional profiles (bio, experience, category selection), and provider discovery (category filtering, sorting, pagination). Builds on existing `ServiceCategory`, `ProviderProfile`, and `Service` entities.

## Technical Context

**Language/Version**: NestJS / Node.js (TypeScript)

**Primary Dependencies**: TypeORM, class-validator, class-transformer, @nestjs/swagger, @nestjs/throttler

**Storage**: PostgreSQL (UUID primary keys, snake_case tables)

**Testing**: Jest (Unit & Integration)

**Target Platform**: Backend API (NestJS Modules)

**Project Type**: Web-service (NestJS Modules under `src/modules/`)

**Performance Goals**:
- Category CRUD: <300ms p95 (SC-001)
- Provider listing with category filter: <500ms for 10K providers (SC-002)
- 100% unauthorized access blocked (SC-003)
- Accurate pagination/sorting (SC-004)

**Constraints**: REST conventions, UUID PKs only, class-validator DTOs, Swagger decorators required, JWT + Role Guards on all protected endpoints

**Scale/Scope**: Herfa Platform (Customer/Provider/Admin Marketplace)

### Unknowns to Resolve
1. **ProviderCategory entity design**: Should this be a direct join table between `ProviderProfile` and `ServiceCategory`, or should it build on the existing `ProviderService` → `Service` → `ServiceCategory` chain?
2. **experienceYears field**: Does `ProviderProfile` need a new `experienceYears` column, or is existing data sufficient?
3. **Provider search sorting**: What sort directions (ASC/DESC) for experience and rating?
4. **Category soft-delete vs hard-delete**: Impact on existing provider assignments (Edge Case: Deletion Impact).
5. **Admin verification/suspension**: Should this be in `ProvidersModule` or `AdminModule`?

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined? ✅ — data-model.md defines ServiceCategory (existing), ProviderCategory (new), ProviderProfile (enhanced)
- [x] P2: Clean Architecture followed? ✅ — Controller → Service → Repository in all modules
- [x] P3: Dedicated NestJS module planned? ✅ — CategoriesModule (new), ProvidersModule (enhanced)
- [x] P4/P6: DTOs & Swagger decorators included? ✅ — Full DTOs and API contracts in contracts/
- [x] P7/P8: JWT/Roles/Guards identified? ✅ — Admin, Provider, Public access defined
- [x] P9: PostgreSQL UUIDs & Timestamps included? ✅ — All entities compliant
- [x] P10/P11: Structured Errors & Logging planned? ✅ — Error codes documented in contracts
- [x] P15: All 12 workflow steps accounted for? ✅ — Full workflow in quickstart.md

## Project Structure

### Documentation (this feature)

```text
specs/002-categories-provider-profile/
├── plan.md              # This file
├── research.md          # Phase 0 output — resolved unknowns
├── data-model.md        # Phase 1 output — entity definitions
├── quickstart.md        # Phase 1 output — setup steps
├── contracts/           # Phase 1 output — API contracts
│   ├── categories-api.md
│   └── provider-discovery-api.md
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── modules/
│   ├── categories/               # NEW module (or refactor ServicesModule)
│   │   ├── dto/
│   │   │   ├── create-category.dto.ts
│   │   │   ├── update-category.dto.ts
│   │   │   └── category-query.dto.ts
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── categories.module.ts
│   ├── providers/                # EXISTING — enhance
│   │   ├── dto/
│   │   │   ├── providers.dto.ts  # EXISTING — update
│   │   │   └── provider-category.dto.ts  # NEW
│   │   ├── providers.controller.ts  # EXISTING — update
│   │   ├── providers.service.ts     # EXISTING — update
│   │   └── providers.module.ts      # EXISTING — update
│   └── admin/                    # EXISTING — optional delegation
├── entities/
│   ├── service-category.entity.ts  # EXISTING
│   ├── provider-profile.entity.ts  # EXISTING — add experienceYears
│   ├── provider-category.entity.ts # NEW — join table
│   └── ... (other existing entities)
└── database/
    └── migrations/               # NEW migration for schema changes
```

**Structure Decision**: Single NestJS backend project. New `CategoriesModule` provides Admin CRUD + public category listing. Existing `ProvidersModule` enhanced with category selection, experience years, sorting, and category-filtered search.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New `ProviderCategory` join table instead of reusing `ProviderService`→`Service`→`ServiceCategory` chain | Spec explicitly requires many-to-many Provider↔Category (FR-003, FR-006). Current chain is Provider→Service→ServiceCategory (indirect). Direct join enables simpler category filtering without joining through services. | Using existing chain adds unnecessary JOIN complexity for category-level filtering and doesn't match spec entity requirements. |
| New `experienceYears` column on `ProviderProfile` | Spec FR-005 requires experience years as separate field | Reusing existing fields would misrepresent the data model |
