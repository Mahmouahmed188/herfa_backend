# Tasks: Services Management

**Input**: Design documents from `specs/003-services-management/`

**Prerequisites**: plan.md (tech stack), spec.md (user stories)

**Tests**: Unit tests are included as requested in the feature specification deliverables.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and module structure

- [ ] T001 Create ServicesModule directory structure at src/modules/services/ (dto/, entities/)
- [ ] T002 [P] Add Service and ServiceImage entities to Prisma schema in prisma/schema.prisma
- [ ] T003 Generate Prisma client and migration: npx prisma migrate dev --name add_services_and_images

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core entities, DTOs, and module structure — MUST complete before user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T004 [P] Create Service entity in src/entities/service.entity.ts with all fields (P1/P9)
- [ ] T005 [P] Create ServiceImage entity in src/entities/service-image.entity.ts (P1/P9)
- [ ] T006 [P] Create CreateServiceDto, UpdateServiceDto, ServiceFilterDto, ServiceImageDto in src/modules/services/dto/service.dto.ts (P4)
- [ ] T007 Create ServicesModule in src/modules/services/services.module.ts with TypeOrm.forFeature([Service, ServiceImage]) (P3)
- [ ] T008 Setup conflict detection for the existing ServicesModule (src/modules/services/) — this feature extends the existing module

**Checkpoint**: Core entities and module structure ready

---

## Phase 3: User Story 1 - Provider Service Management (Priority: P1) 🎯 MVP

**Goal**: Allow Providers to create, update, delete, and manage their own services.

**Independent Test**: A provider can create a service under a valid category and verify it appears in their own service list.

### Implementation for User Story 1

- [ ] T009 [P] [US1] Implement ownership guard logic — only service owner can modify (FR-009)
- [ ] T010 [US1] Implement create, update, delete, and toggle-status logic in ServicesService in src/modules/services/services.service.ts (P2)
- [ ] T011 [US1] Implement Provider service endpoints (POST, GET /my-services, PATCH, DELETE, PATCH /status) in ServicesController in src/modules/services/services.controller.ts (P5)
- [ ] T012 [US1] Add Swagger decorators to all provider service endpoints (P6)
- [ ] T013 [US1] Create unit tests for service CRUD in src/modules/services/services.service.spec.ts (P15)

**Checkpoint**: Provider service management is functional

---

## Phase 4: User Story 2 - Customer Service Discovery (Priority: P1)

**Goal**: Allow Customers to browse, search, and filter active services.

**Independent Test**: A customer can filter services by category and price range and verify matching results.

### Implementation for User Story 2

- [ ] T014 [P] [US2] Implement search and filtering logic with pagination in ServicesService (P2)
- [ ] T015 [US2] Implement public GET /services and GET /services/:id endpoints in ServicesController (P5)
- [ ] T016 [US2] Add Swagger decorators for discovery endpoints with filtering/pagination schemas (P6)
- [ ] T017 [US2] Create unit tests for service discovery and filtering (P15)

**Checkpoint**: Customer service discovery is functional

---

## Phase 5: User Story 3 - Service Image Management (Priority: P2)

**Goal**: Allow Providers to upload and manage multiple images per service.

**Independent Test**: A provider can add images to a service, designate a primary, and verify images in the service details.

### Implementation for User Story 3

- [ ] T018 [P] [US3] Implement image management logic (add, set primary, remove) in ServicesService (P2)
- [ ] T019 [US3] Implement image endpoints (POST /images, PATCH /images/:id/primary, DELETE /images/:id) in ServicesController (P5)
- [ ] T020 [US3] Add Swagger decorators for image endpoints (P6)
- [ ] T021 [US3] Create unit tests for image management (P15)

**Checkpoint**: Service image management is functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and compliance

- [ ] T022 Implement Admin view-all and deactivate-service endpoints (FR-010 — deactivate only)
- [ ] T023 Add automatic service deactivation when provider is suspended (FR-012)
- [ ] T024 Verify all Swagger documentation is complete across all endpoints
- [ ] T025 Run integration tests for full service lifecycle (create → search → update → deactivate)

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
