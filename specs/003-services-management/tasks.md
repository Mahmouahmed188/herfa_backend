# Tasks: Services Management

**Input**: Design documents from `specs/003-services-management/`

**Prerequisites**: plan.md (tech stack), spec.md (user stories)

**Tests**: Unit tests are included as requested in the feature specification deliverables.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and module structure

- [X] T001 Create ServicesModule directory structure at src/modules/services/ (dto/, entities/)
- [X] T002 [P] Add Service and ServiceImage entities to Prisma schema in prisma/schema.prisma
- [X] T003 Generate Prisma client: npx prisma generate

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core entities, DTOs, and module structure — MUST complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 [P] Create ServiceListing entity in src/entities/service-listing.entity.ts (P1/P9)
- [X] T005 [P] Create ServiceImage entity in src/entities/service-image.entity.ts (P1/P9)
- [X] T006 [P] Create DTOs in src/modules/services/dto/service.dto.ts (P4)
- [X] T007 Create ServicesModule in src/modules/services/services.module.ts with TypeOrm.forFeature([ServiceListing, ServiceImage]) (P3)
- [X] T008 Update existing ServicesModule to integrate new provider service endpoints without breaking backward compatibility

**Checkpoint**: Core entities and module structure ready

---

## Phase 3: User Story 1 - Provider Service Management (Priority: P1) 🎯 MVP

**Goal**: Allow Providers to create, update, delete, and manage their own services.

**Independent Test**: A provider can create a service under a valid category and verify it appears in their own service list.

### Implementation for User Story 1

- [X] T009 [P] [US1] Implement ownership guard in ServicesService — only service owner can modify (FR-009)
- [X] T010 [US1] Implement CRUD + toggle-status in ServicesService (P2)
- [X] T011 [US1] Implement ProviderServicesController for provider endpoints in services.controller.ts (P5)
- [X] T012 [US1] Add Swagger decorators to all provider service endpoints (P6)
- [X] T013 [US1] Create unit tests in src/modules/services/services.service.spec.ts (P15)

**Checkpoint**: Provider service management is functional

---

## Phase 4: User Story 2 - Customer Service Discovery (Priority: P1)

**Goal**: Allow Customers to browse, search, and filter active services.

**Independent Test**: A customer can filter services by category and price range and verify matching results.

### Implementation for User Story 2

- [X] T014 [P] [US2] Implement search and filtering logic with pagination in ServicesService (P2)
- [X] T015 [US2] Implement public GET /services and GET /services/:id endpoints in ServicesController (P5)
- [X] T016 [US2] Add Swagger decorators for discovery endpoints with filtering/pagination schemas (P6)
- [X] T017 [US2] Create unit tests for service discovery and filtering (P15)

**Checkpoint**: Customer service discovery is functional

---

## Phase 5: User Story 3 - Service Image Management (Priority: P2)

**Goal**: Allow Providers to upload and manage multiple images per service.

**Independent Test**: A provider can add images to a service, designate a primary, and verify images in the service details.

### Implementation for User Story 3

- [X] T018 [P] [US3] Implement image management logic (add, set primary, remove) in ServicesService (P2)
- [X] T019 [US3] Implement image endpoints (POST/PATCH/DELETE images) in ProviderServicesController (P5)
- [X] T020 [US3] Add Swagger decorators for image endpoints (P6)
- [X] T021 [US3] Create unit tests for image management (P15)

**Checkpoint**: Service image management is functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and compliance

- [X] T022 Implement Admin view-all and deactivate-service endpoints (FR-010 — deactivate only)
- [ ] T023 Add automatic service deactivation when provider is suspended (FR-012) — requires hook into provider suspension
- [X] T024 Verify all Swagger documentation is complete across all endpoints
- [X] T025 Run integration tests for full service lifecycle (create → search → update → deactivate)

---

## Dependencies & Execution Order

1. **Phase 1 & 2** are blocking prerequisites for all user stories.
2. **Phase 3 (Provider CRUD)** must complete before **Phase 5 (Images)** since images attach to existing services.
3. **Phase 4 (Customer Discovery)** is independent of Phase 3/5 on the provider side but requires services to exist.
4. **Phase 6** is performed after all user stories are implemented.

## Parallel Opportunities

- T004, T005, T006 (entities and DTOs)
- T009, T014, T018 (guards, search, images — different concerns)
- T013, T017, T021 (unit test creation)

## Implementation Strategy

1. **MVP First**: Complete Phases 1, 2, and 3 to allow providers to create services.
2. **Incremental Delivery**: Add Phase 4 for customer discovery, then Phase 5 for images.
3. **Validation**: Each user story phase ends with a checkpoint and unit tests.
