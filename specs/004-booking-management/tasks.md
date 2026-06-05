# Tasks: Booking Management System

**Input**: Design documents from `specs/004-booking-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The spec explicitly lists "Unit Tests" as a deliverable. Test tasks are included for each user story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single NestJS monolith**: `src/` at repository root
- Entities: `src/entities/`
- Modules: `src/modules/bookings/`
- Tests: `test/unit/bookings/` and `test/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Directory setup and file scaffolding

- [x] T001 Create bookings module directory structure at `src/modules/bookings/`, `src/modules/bookings/dto/`, `src/modules/bookings/guards/`, `test/unit/bookings/`, `test/e2e/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Create Booking entity with all fields, indexes, and relationships in `src/entities/booking.entity.ts`
- [x] T003 Create BookingStatusHistory entity with all fields and indexes in `src/entities/booking-status-history.entity.ts`
- [x] T004 Export new Booking and BookingStatusHistory entities from `src/entities/index.ts`
- [x] T005 Create BookingsModule with TypeOrmModule.forFeature and EventEmitterModule imports in `src/modules/bookings/bookings.module.ts`
- [x] T006 [P] Create CreateBookingDto with validation rules and Swagger decorators in `src/modules/bookings/dto/create-booking.dto.ts`
- [x] T007 [P] Create BookingResponseDto with all response fields and Swagger decorators in `src/modules/bookings/dto/booking-response.dto.ts`
- [x] T008 [P] Create BookingFilterDto extending PaginationDto with status, date range, service, category, search fields in `src/modules/bookings/dto/booking-filter.dto.ts`
- [x] T009 [P] Create UpdateStatusDto with status field validation in `src/modules/bookings/dto/update-status.dto.ts`
- [x] T010 [P] Create CancelBookingDto with reason field validation in `src/modules/bookings/dto/cancel-booking.dto.ts`
- [x] T011 [P] Update Prisma schema with Booking and BookingStatusHistory models in `prisma/schema.prisma`
- [x] T012 Initialize BookingsService with status transition validation engine in `src/modules/bookings/bookings.service.ts`
- [x] T013 Create BookingOwnershipGuard for customer/provider data isolation in `src/modules/bookings/guards/booking-ownership.guard.ts`

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 - Customer Creates and Tracks a Booking (Priority: P1) 🎯 MVP

**Goal**: Customers can create bookings, view their booking history, cancel pending bookings, and track booking status through the full lifecycle.

**Independent Test**: Authenticated customer can submit a booking with valid service/provider/address/date/time, see it with "pending" status in their history, view details, and cancel it before provider responds.

- [x] T014 [P] [US1] Implement BookingsService.create() with service existence, provider ownership, and date validation in `src/modules/bookings/bookings.service.ts`
- [x] T015 [P] [US1] Implement BookingsService.findMyBookings() with customer ID filtering, pagination, and sorting in `src/modules/bookings/bookings.service.ts`
- [x] T016 [P] [US1] Implement BookingsService.findOne() with status history inclusion in `src/modules/bookings/bookings.service.ts`
- [x] T017 [P] [US1] Implement BookingsService.cancel() for customer with pending-only restriction in `src/modules/bookings/bookings.service.ts`
- [x] T018 [US1] Implement customer booking controller with POST /bookings, GET /bookings/my-bookings, GET /bookings/:id, PATCH /bookings/:id/cancel in `src/modules/bookings/bookings.controller.ts`
- [x] T019 [P] [US1] Add customer controller unit tests in `test/unit/bookings/bookings.controller.spec.ts`
- [x] T020 [P] [US1] Add BookingsService unit tests for customer flows in `test/unit/bookings/bookings.service.spec.ts`
- [x] T021 [US1] Create e2e test for customer booking lifecycle (create → view → cancel) in `test/bookings.e2e-spec.ts`

**Checkpoint**: User Story 1 is fully functional and independently testable — MVP ready

---

## Phase 4: User Story 2 - Provider Manages Incoming Bookings (Priority: P1)

**Goal**: Providers can view assigned bookings, accept/reject pending requests, and progress bookings through on_the_way → in_progress → completed stages with history recording and event emission.

**Independent Test**: Authenticated provider can view their assigned bookings, accept a pending request, progress it through all stages, and see the status reflected in booking details.

- [x] T022 [P] [US2] Implement BookingsService.findProviderBookings() with provider ID filtering in `src/modules/bookings/bookings.service.ts`
- [x] T023 [P] [US2] Implement BookingsService.accept() and reject() with pending-only validation in `src/modules/bookings/bookings.service.ts`
- [x] T024 [P] [US2] Implement BookingsService.markOnTheWay(), markInProgress(), markCompleted() with ordered transition validation in `src/modules/bookings/bookings.service.ts`
- [x] T025 [P] [US2] Implement BookingsService.recordStatusHistory() for immutable audit log insertion in `src/modules/bookings/bookings.service.ts`
- [x] T026 [P] [US2] Implement event emission via EventEmitter2 on all status transitions in `src/modules/bookings/bookings.service.ts`
- [x] T027 [US2] Implement provider booking controller with GET /provider/bookings, PATCH /bookings/:id/accept, PATCH /bookings/:id/reject, PATCH /bookings/:id/on-the-way, PATCH /bookings/:id/start, PATCH /bookings/:id/complete in `src/modules/bookings/bookings.controller.ts`
- [x] T028 [P] [US2] Add provider controller unit tests in `test/unit/bookings/bookings.controller.spec.ts`
- [x] T029 [P] [US2] Add BookingsService unit tests for provider flows (accept, reject, status progression, history recording, event emission) in `test/unit/bookings/bookings.service.spec.ts`
- [x] T030 [US2] Extend e2e test with full provider booking management flow in `test/bookings.e2e-spec.ts`

**Checkpoint**: User Stories 1 AND 2 should both work independently and together

---

## Phase 5: User Story 3 - Admin Oversees All Bookings (Priority: P2)

**Goal**: Administrators can view all bookings with filters, see audit history, and cancel any booking with mandatory reason and audit logging.

**Independent Test**: Authenticated admin can view all bookings, see complete status history for any booking, and cancel a booking with a recorded reason.

- [x] T031 [P] [US3] Implement BookingsService.findAll() with full filter/sort/pagination support for admin in `src/modules/bookings/bookings.service.ts`
- [x] T032 [P] [US3] Implement BookingsService.adminCancel() with mandatory reason and heightened audit logging in `src/modules/bookings/bookings.service.ts`
- [x] T033 [US3] Implement admin booking controller with GET /admin/bookings, GET /admin/bookings/:id, PATCH /admin/bookings/:id/cancel in `src/modules/bookings/bookings.controller.ts`
- [x] T034 [P] [US3] Add admin controller unit tests in `test/unit/bookings/bookings.controller.spec.ts`
- [x] T035 [P] [US3] Add BookingsService unit tests for admin flows in `test/unit/bookings/bookings.service.spec.ts`

**Checkpoint**: All three user stories should be independently functional

---

## Phase 6: User Story 4 - Customer Searches and Filters Bookings (Priority: P3)

**Goal**: Customers can search booking history by booking number, filter by status and date range, and sort results.

**Independent Test**: Authenticated customer can filter their bookings by status, specify a date range, and search by booking number, with correct results returned.

- [x] T036 [US4] Integrate BookingFilterDto into findMyBookings() with status, date range, booking number search, pagination, and sorting in `src/modules/bookings/bookings.service.ts`
- [x] T037 [US4] Add search/filter unit tests for customer booking queries in `test/unit/bookings/bookings.service.spec.ts`
- [x] T038 [US4] Extend e2e test with search, filter, and pagination scenarios in `test/bookings.e2e-spec.ts`

**Checkpoint**: All user stories complete and independently testable

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final verification

- [x] T039 Import and register BookingsModule in AppModule at `src/app.module.ts`
- [x] T040 Add full Swagger documentation with status transition workflow, 
request/response examples, and authorization requirements to all booking endpoints
- [x] T041 Run linting and fix any issues: `npm run lint`
- [x] T042 Run full test suite and ensure all tests pass: `npm run test`
- [x] T043 Run build and verify compilation: `npm run build`
**Checkpoint**: Feature complete and verified

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 are both P1. US1 should complete first to establish the booking base, then US2 builds on it.
  - US3 (P2) depends on US1 complete (needs booking CRUD to exist)
  - US4 (P3) depends on US1 complete (enhances the customer listing)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependencies on other stories
- **User Story 2 (P1)**: Depends on US1 (provider actions require bookings to exist)
- **User Story 3 (P2)**: Depends on US1 (admin actions require booking CRUD)
- **User Story 4 (P3)**: Depends on US1 (extends customer listing with filters)

### Within Each User Story

- Unit tests for each story should be written alongside the implementation
- Service methods before controller endpoints
- Controller endpoints before e2e tests
- E2e tests for customer flow (US1) before provider flow (US2)

### Parallel Opportunities

- T006 through T011 (DTOs + Prisma): All independent, can run in parallel
- T014 through T017 (Service methods US1): All independent methods on different files... actually no, same file. But they are independent implementations within the same file.
- T019 and T020 (Tests US1): Can run in parallel
- T022 through T026 (Service methods US2): Independent implementations within same file
- T034 and T035 (Tests US3): Can run in parallel
- T041, T042, T043 (Polish): Can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all DTO tasks in parallel:
Task: "Create CreateBookingDto in src/modules/bookings/dto/create-booking.dto.ts"
Task: "Create BookingResponseDto in src/modules/bookings/dto/booking-response.dto.ts"
Task: "Create BookingFilterDto in src/modules/bookings/dto/booking-filter.dto.ts"
Task: "Create UpdateStatusDto in src/modules/bookings/dto/update-status.dto.ts"
Task: "Create CancelBookingDto in src/modules/bookings/dto/cancel-booking.dto.ts"

# Entity + Prisma in parallel:
Task: "Create Booking entity in src/entities/booking.entity.ts"
Task: "Create BookingStatusHistory entity in src/entities/booking-status-history.entity.ts"
Task: "Update Prisma schema in prisma/schema.prisma"
```

## Parallel Example: User Story 1

```bash
# All service methods can be written together:
Task: "Implement BookingsService.create() in src/modules/bookings/bookings.service.ts"
Task: "Implement BookingsService.findMyBookings() in src/modules/bookings/bookings.service.ts"
Task: "Implement BookingsService.findOne() in src/modules/bookings/bookings.service.ts"
Task: "Implement BookingsService.cancel() in src/modules/bookings/bookings.service.ts"

# Tests can be written in parallel:
Task: "Add customer controller unit tests in test/unit/bookings/bookings.controller.spec.ts"
Task: "Add BookingsService unit tests in test/unit/bookings/bookings.service.spec.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Customer booking flow)
4. **STOP and VALIDATE**: Test US1 independently
5. Deploy/demo if ready — customers can create and cancel bookings

### Incremental Delivery

1. **MVP**: Setup + Foundational + US1 → Customers can create/view/cancel bookings
2. **Provider Enablement**: Add US2 → Providers can accept, reject, and progress bookings
3. **Admin Oversight**: Add US3 → Admins can view and intervene on all bookings
4. **Power Features**: Add US4 → Customers can search and filter their booking history
5. Each phase adds value without breaking previous phases

### Parallel Team Strategy

With multiple developers:

1. **Team completes Foundation together** (Phase 1 + 2)
2. **Once Foundation is done**:
   - Developer A: US1 core (T014-T018)
   - Developer B: US1 tests (T019-T021)
   - Developer C: DTOs + Prisma (T006-T011) then US2 service (T022-T026)
3. **After US1 complete**:
   - Developer A: US2 controller + tests (T027-T030)
   - Developer B: US3 (T031-T035)
   - Developer C: US4 (T036-T038)
4. **Final**: Polish together (Phase 7)

---

## Task Summary

| Phase | Story | Tasks | Count |
|-------|-------|-------|-------|
| Phase 1 | Setup | T001 | 1 |
| Phase 2 | Foundational | T002–T013 | 12 |
| Phase 3 | US1 (P1) MVP | T014–T021 | 8 |
| Phase 4 | US2 (P1) | T022–T030 | 9 |
| Phase 5 | US3 (P2) | T031–T035 | 5 |
| Phase 6 | US4 (P3) | T036–T038 | 3 |
| Phase 7 | Polish | T039–T043 | 5 |
| **Total** | | **T001–T043** | **43** |
