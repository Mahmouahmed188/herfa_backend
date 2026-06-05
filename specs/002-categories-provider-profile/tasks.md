# Tasks: Categories & Provider Profiles

**Input**: Design documents from `/specs/002-categories-provider-profile/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests are included as per the feature specification requirement.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup

- [ ] T001 Create module structure for Categories and Providers per plan.md
- [ ] T002 [P] Configure Prisma schema for Categories and ProviderProfile entities in prisma/schema.prisma (P1/P9)
- [ ] T003 Generate Prisma client and migration: npx prisma migrate dev --name add_categories_and_profiles (P15 step 3)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic and utility infrastructure

**⚠️ CRITICAL**: Must complete before user stories

- [ ] T004 [P] Initialize CategoriesModule and ProvidersModule in src/modules/
- [ ] T005 [P] Setup pagination and sorting utilities in src/common/dto/pagination.dto.ts
- [ ] T006 Configure global RolesGuard for protected endpoints (P8)

**Checkpoint**: Core structure and database layer ready

---

## Phase 3: User Story 1 - Service Categorization (Priority: P1) 🎯 MVP

**Goal**: Allow Admins to manage service categories

**Independent Test**: Create a category via POST /categories as Admin and verify it appears in GET /categories.

### Implementation for User Story 1

- [ ] T007 [P] [US1] Create CreateCategoryDto and UpdateCategoryDto in src/modules/categories/dto/category.dto.ts (P4)
- [ ] T008 [US1] Implement CRUD logic in CategoriesService in src/modules/categories/categories.service.ts (P2)
- [ ] T009 [US1] Implement Admin endpoints in CategoriesController in src/modules/categories/categories.controller.ts (P5)
- [ ] T010 [US1] Add Swagger documentation for category endpoints (P6)
- [ ] T011 [US1] Create unit tests for category management in src/modules/categories/categories.service.spec.ts (P15)

**Checkpoint**: Category management is functional

---

## Phase 4: User Story 2 - Provider Professional Profile (Priority: P1)

**Goal**: Allow Providers to manage their professional identity and categories

**Independent Test**: Update profile bio and link categories as a Provider, then verify retrieval.

### Implementation for User Story 2

- [ ] T012 [P] [US2] Create UpdateProviderProfileDto and ProviderCategoryDto in src/modules/providers/dto/provider.dto.ts (P4)
- [ ] T013 [US2] Implement profile update and category linking in ProvidersService in src/modules/providers/providers.service.ts (P2)
- [ ] T014 [US2] Implement Provider self-service endpoints in ProvidersController in src/modules/providers/providers.controller.ts (P5)
- [ ] T015 [US2] Add Swagger documentation for provider profile endpoints (P6)
- [ ] T016 [US2] Create unit tests for provider profile logic in src/modules/providers/providers.service.spec.ts (P15)

**Checkpoint**: Provider profile management is functional

---

## Phase 5: User Story 3 - Provider Discovery (Priority: P2)

**Goal**: Allow Customers to browse and filter providers by category

**Independent Test**: Filter providers by a specific categoryId and verify only matching providers are returned.

### Implementation for User Story 3

- [ ] T017 [US3] Implement search and filtering logic with pagination in ProvidersService (P2)
- [ ] T018 [US3] Implement public GET /providers and GET /providers/:id in ProvidersController (P5)
- [ ] T019 [US3] Add Swagger documentation for discovery endpoints with filtering/pagination schemas (P6)
- [ ] T020 [US3] Create unit tests for provider discovery and filtering (P15)

**Checkpoint**: Provider discovery is functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and compliance

- [ ] T021 Implement Admin verification/suspension logic for providers (FR-009)
- [ ] T022 Final verification of API contracts and Swagger documentation completeness (P15)
- [ ] T023 Run integration tests for full category-to-provider flow (P15)

---

## Dependencies & Execution Order

1. **Phase 1 & 2** are blocking prerequisites.
2. **Phase 3 (Categories)** must complete before **Phase 4** can fully link providers to categories.
3. **Phase 4 (Profiles)** must complete before **Phase 5 (Discovery)** has data to display.
4. **Phase 6** is performed after all user stories are implemented.

## Parallel Opportunities

- T005, T007, T012 (DTO definitions)
- T011, T016, T020 (Unit testing preparation)
- T010, T015, T019 (Swagger documentation)

## Implementation Strategy

1. **MVP First**: Complete Phases 1, 2, and 3 to allow category creation.
2. **Incremental Delivery**: Add Phase 4 for provider profiles, then Phase 5 for customer discovery.
3. **Validation**: Each user story phase ends with a checkpoint and unit tests.
