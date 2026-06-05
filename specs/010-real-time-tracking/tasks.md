---

description: "Task list for Real-Time Tracking System implementation"

---

# Tasks: Real-Time Tracking System

**Input**: Design documents from `/specs/010-real-time-tracking/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests are included as requested in the feature specification (Deliverables section).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `prisma/` at repository root
- Module files under `src/modules/tracking/`
- Entities under `src/entities/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review existing project state and design documents

- [ ] T001 Review plan.md, spec.md, research.md, data-model.md, and contracts/ for this feature

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, entities, DTOs, and module setup that MUST be complete before any user story can begin

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 [P] Add Prisma models (TrackingSession, TrackingLocation, TrackingAuditEvent) and tracking_session_status_enum in prisma/schema.prisma
- [ ] T003 [P] Generate Prisma migration via `npx prisma migrate dev --name add-tracking-sessions`
- [ ] T004 [P] Create TrackingSession entity in src/entities/tracking-session.entity.ts
- [ ] T005 [P] Create TrackingLocation entity in src/entities/tracking-location.entity.ts
- [ ] T006 [P] Create StartTrackingDto in src/modules/tracking/dto/start-tracking.dto.ts
- [ ] T007 [P] Create LocationUpdateDto in src/modules/tracking/dto/location-update.dto.ts
- [ ] T008 [P] Create TrackingSessionResponseDto + TrackingHistoryResponseDto in src/modules/tracking/dto/tracking-session.dto.ts
- [ ] T009 [P] Create TrackingFilterDto (extending PaginationDto) in src/modules/tracking/dto/tracking-filter.dto.ts
- [ ] T010 [P] Create PauseResumeResponseDto in src/modules/tracking/dto/pause-resume.dto.ts
- [ ] T011 [P] Create TrackingOwnershipGuard in src/modules/tracking/guards/tracking-ownership.guard.ts
- [ ] T012 Update tracking.module.ts to import TypeOrmModule.forFeature([TrackingSession, TrackingLocation]) and register new providers/controllers

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Provider shares live location during active booking (Priority: P1) 🎯 MVP

**Goal**: Provider can start a tracking session for an accepted booking, send periodic location updates, and pause/resume/complete tracking

**Independent Test**: A provider with a booking in "accepted" status can call POST /tracking/start, receive a session ID, call PATCH /tracking/location with valid coordinates, and verify the session transitions through active/paused/resumed/completed states

### Implementation for User Story 1

- [ ] T013 [US1] Implement TrackingService with startSession, updateLocation, pauseSession, resumeSession, completeSession methods in src/modules/tracking/tracking.service.ts
- [ ] T014 [US1] Implement ProviderTrackingController with POST /tracking/start, PATCH /tracking/location, PATCH /tracking/pause, PATCH /tracking/resume, PATCH /tracking/complete in src/modules/tracking/provider-tracking.controller.ts
- [ ] T015 [P] [US1] Add Swagger documentation (ApiTags, ApiOperation, ApiBearerAuth, ApiResponse) to all provider tracking endpoints
- [ ] T016 [P] [US1] Create unit tests for TrackingService in src/modules/tracking/tracking.service.spec.ts
- [ ] T017 [P] [US1] Create unit tests for ProviderTrackingController in src/modules/tracking/provider-tracking.controller.spec.ts

**Checkpoint**: US1 complete - provider can fully manage tracking sessions. This is the MVP.

---

## Phase 4: User Story 2 - Customer views provider's live location (Priority: P1)

**Goal**: Customer can view the provider's current location, estimated distance, and estimated arrival time for their active booking

**Independent Test**: A customer with a booking that has an active tracking session can call GET /tracking/:bookingId and receive the provider's current location, distance remaining, and ETA

### Implementation for User Story 2

- [ ] T018 [US2] Implement getSession method in TrackingService to retrieve latest tracking state for a booking
- [ ] T019 [US2] Implement TrackingController with GET /tracking/:bookingId endpoint in src/modules/tracking/tracking.controller.ts
- [ ] T020 [US2] Add Swagger documentation to customer tracking endpoints
- [ ] T021 [P] [US2] Update TrackingGateway to emit providerLocation events to booking rooms (job:bookingId)
- [ ] T022 [P] [US2] Create unit tests for TrackingController in src/modules/tracking/tracking.controller.spec.ts

**Checkpoint**: US2 complete - customers can now view provider's live location

---

## Phase 5: User Story 3 - Admin monitors all active tracking sessions (Priority: P2)

**Goal**: Admin can view all tracking sessions across the platform and drill into session details including location history

**Independent Test**: An admin can call GET /admin/tracking with optional filters and receive a paginated list of all tracking sessions

### Implementation for User Story 3

- [ ] T023 [US3] Implement getAdminSessions and getAdminSessionDetail methods in TrackingService with filtering, pagination, and sorting
- [ ] T024 [US3] Implement AdminTrackingController with GET /admin/tracking and GET /admin/tracking/:id in src/modules/tracking/admin-tracking.controller.ts
- [ ] T025 [US3] Add Swagger documentation to admin tracking endpoints
- [ ] T026 [P] [US3] Create unit tests for AdminTrackingController in src/modules/tracking/admin-tracking.controller.spec.ts

**Checkpoint**: US3 complete - admins have full oversight of tracking activity

---

## Phase 6: User Story 4 - Customer views tracking history (Priority: P3)

**Goal**: Customer can view the immutable chronological log of all location updates from a completed booking's tracking session

**Independent Test**: A customer with a completed booking can call GET /tracking/:bookingId/history and receive a paginated list of all location records with timestamps

### Implementation for User Story 4

- [ ] T027 [US4] Add getHistory with pagination support to TrackingService in src/modules/tracking/tracking.service.ts
- [ ] T028 [US4] Add GET /tracking/:bookingId/history endpoint to TrackingController in src/modules/tracking/tracking.controller.ts
- [ ] T029 [US4] Add Swagger documentation to tracking history endpoint
- [ ] T030 [P] [US4] Add unit tests for tracking history endpoint in src/modules/tracking/tracking.controller.spec.ts

**Checkpoint**: US4 complete - customers can review tracking history for completed bookings

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Event integration, WebSocket enhancement, and audit logging that span multiple user stories

- [ ] T031 [P] Integrate @nestjs/event-emitter events (tracking.started, tracking.paused, tracking.resumed, tracking.completed, tracking.arrived_nearby, tracking.arrived) in TrackingService
- [ ] T032 [P] Add audit logging for tracking session lifecycle events (creation, activation, pause, resume, completion, termination) using NestJS Logger
- [ ] T033 Run quickstart.md validation steps to verify all components work together

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 and US2 can proceed in parallel (different controllers, share service)
  - US3 depends on getAdminSessions in service (can start after T013)
  - US4 depends on getHistory in service (can start after T013)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: No dependencies on other stories - the MVP
- **User Story 2 (P1)**: Depends on US1 (needs active tracking session to display)
- **User Story 3 (P2)**: Depends on foundational only - independent from US1/US2
- **User Story 4 (P3)**: Depends on US1 and US2 (needs tracking session + customer endpoints)

### Within Each User Story

- Models/entities are in foundational phase (before stories)
- Services before controllers
- Swagger docs after controller implementation
- Tests alongside implementation

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel
- DTOs (T006-T010) are fully independent
- Entities (T004, T005) and Prisma (T002) can be done in parallel
- US1 and US3 can be implemented in parallel after Phase 2
- All test files marked [P] can be written in parallel
- Event integration (T031) and audit logging (T032) are independent

---

## Parallel Example: Foundational Phase

```bash
# Launch all independent foundational tasks together:
- T002: Add Prisma models in prisma/schema.prisma
- T004: Create TrackingSession entity in src/entities/tracking-session.entity.ts
- T005: Create TrackingLocation entity in src/entities/tracking-location.entity.ts
- T006: Create StartTrackingDto in src/modules/tracking/dto/start-tracking.dto.ts
- T007: Create LocationUpdateDto in src/modules/tracking/dto/location-update.dto.ts
- T008: Create response DTOs in src/modules/tracking/dto/tracking-session.dto.ts
- T009: Create TrackingFilterDto in src/modules/tracking/dto/tracking-filter.dto.ts
- T010: Create PauseResumeResponseDto in src/modules/tracking/dto/pause-resume.dto.ts
- T011: Create TrackingOwnershipGuard in src/modules/tracking/guards/tracking-ownership.guard.ts
```

## Parallel Example: User Stories 1 & 3 (Independent)

```bash
# US1: Provider tracking (depends on T013 TrackingService)
- T014: ProviderTrackingController in src/modules/tracking/provider-tracking.controller.ts
- T016: TrackingService unit tests in src/modules/tracking/tracking.service.spec.ts

# US3: Admin oversight (independent of US1, also depends on T013)
- T024: AdminTrackingController in src/modules/tracking/admin-tracking.controller.ts
- T026: AdminTrackingController unit tests in src/modules/tracking/admin-tracking.controller.spec.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001)
2. Complete Phase 2: Foundational (T002-T012)
3. Complete Phase 3: User Story 1 (T013-T017)
4. **STOP and VALIDATE**: Provider can start, update, pause, resume, and complete tracking sessions
5. Deploy/demo if ready - this is the MVP

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Provider tracking) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Customer viewing) → Test independently → Deploy/Demo
4. Add User Story 3 (Admin oversight) → Test independently → Deploy/Demo
5. Add User Story 4 (Tracking history) → Test independently → Deploy/Demo
6. Add Polish (Events, WebSocket, Audit) → Final integration

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Provider endpoints)
   - Developer B: User Story 3 (Admin endpoints) - independent
3. After US1 complete:
   - Developer A: User Story 2 (Customer endpoints)
   - Developer B: User Story 4 (History) + Polish

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All tasks reference exact file paths for immediate execution
- Commit after each logical group of tasks
- Stop at any checkpoint to validate story independently
