# Tasks: Support Tickets & Disputes System

**Input**: Design documents from `/specs/011-support-tickets-disputes/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in the feature specification — test tasks are excluded from this task list.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths below assume NestJS backend at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic module structure

- [ ] T001 Create `src/modules/support/` directory structure with subdirectories: `services/`, `guards/`, `dto/`, `enums/`
- [ ] T002 [P] Create enums in `src/modules/support/enums/`: `ticket-category.enum.ts` (Technical, Booking, Payment, Account, Verification, General), `ticket-status.enum.ts` (open, in_progress, waiting_for_user, resolved, closed), `ticket-priority.enum.ts` (low, medium, high, urgent), `dispute-status.enum.ts` (open, under_review, awaiting_evidence, resolved_customer, resolved_provider, closed)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 [P] Create `SupportTicket` entity in `src/entities/support-ticket.entity.ts` with all columns, relationships to User (userId, assignedAdminId), and indexes from data-model.md
- [ ] T004 [P] Create `TicketMessage` entity in `src/entities/ticket-message.entity.ts` with all columns, relationship to SupportTicket and User, and indexes from data-model.md
- [ ] T005 [P] Create `Dispute` entity in `src/entities/dispute.entity.ts` with all columns, relationships to Booking and User (customerId, providerId, resolvedBy), and indexes from data-model.md
- [ ] T006 [P] Create `DisputeEvidence` entity in `src/entities/dispute-evidence.entity.ts` with all columns, relationships to Dispute and User, and indexes from data-model.md
- [ ] T007 Generate TypeORM migration for new tables: `support_tickets`, `ticket_messages`, `disputes`, `dispute_evidence` with all indexes and foreign keys
- [ ] T008 [P] Create base DTOs: `create-ticket.dto.ts`, `ticket-response.dto.ts`, `create-ticket-message.dto.ts`, `ticket-message-response.dto.ts` in `src/modules/support/dto/` with class-validator rules
- [ ] T009 [P] Create dispute DTOs: `create-dispute.dto.ts`, `dispute-response.dto.ts`, `create-dispute-evidence.dto.ts`, `dispute-evidence-response.dto.ts` in `src/modules/support/dto/` with class-validator rules
- [ ] T010 [P] Create admin DTOs: `update-ticket-status.dto.ts`, `update-dispute-status.dto.ts`, `resolve-dispute.dto.ts` in `src/modules/support/dto/` with class-validator rules
- [ ] T011 [P] Create filter DTOs: `ticket-filter.dto.ts`, `dispute-filter.dto.ts` in `src/modules/support/dto/` with optional fields and Swagger decorators
- [ ] T012 [P] Create `ticket-ownership.guard.ts` in `src/modules/support/guards/` to ensure authenticated user owns the requested ticket
- [ ] T013 [P] Create `dispute-participant.guard.ts` in `src/modules/support/guards/` to ensure authenticated user is a participant (customer or provider) of the requested dispute
- [ ] T014 Create `SupportModule` in `src/modules/support/support.module.ts` registering TypeORM entities, importing AuthModule, BookingsModule, NotificationsModule, and UploadsModule
- [ ] T015 Register `SupportModule` in `src/app.module.ts` imports array

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Customer Creates a Support Ticket (Priority: P1) 🎯 MVP

**Goal**: A customer can create a support ticket with category, subject, and description, receive a unique ticket number, and view their ticket history.

**Independent Test**: Create ticket via POST /support/tickets → receive 201 with ticketNumber → GET /support/tickets lists the new ticket → GET /support/tickets/:id returns full details.

- [ ] T016 [P] [US1] Implement `ticketNumber` generator utility in `src/modules/support/services/ticket-number.service.ts` generating unique TKT-XXXXXXXX format
- [ ] T017 [US1] Implement `TicketsService` in `src/modules/support/services/tickets.service.ts` with methods: `create(userId, dto)`, `findById(id)`, `findAll(userId, filter)`, `findAllAdmin(filter)` including CRUD, filtering, pagination, sorting, and search by ticket number
- [ ] T018 [US1] Create entity enums for ticket status transition validation in `src/modules/support/enums/` — implement status transition validator as a reusable function or utility
- [ ] T019 [US1] Implement `SupportController` in `src/modules/support/support.controller.ts` with endpoints: `POST /support/tickets`, `GET /support/tickets`, `GET /support/tickets/:id`
- [ ] T020 [US1] Add Swagger decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`) to all US1 endpoints with request/response examples from contracts/README.md
- [ ] T021 [US1] Wire audit logging in TicketsService — log ticket creation action to `AuditLog`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 — Provider Opens a Booking Dispute (Priority: P1)

**Goal**: A provider can open a dispute against a completed or active booking, with participant validation.

**Independent Test**: Create dispute via POST /support/disputes with valid bookingId → receive 201 → GET /support/disputes lists the new dispute → GET /support/disputes/:id returns full details including linked booking.

- [ ] T022 [P] [US2] Create dispute business rules service or add methods to `DisputesService` for: booking existence validation (via BookingsModule), participant check (user is customer or provider of booking), duplicate open dispute check
- [ ] T023 [US2] Implement `DisputesService` in `src/modules/support/services/disputes.service.ts` with methods: `create(userId, dto)`, `findById(id)`, `findAll(userId, filter)`, `findAllAdmin(filter)`, `updateStatus(id, status)`, `resolve(id, dto, adminId)`
- [ ] T024 [US2] Create dispute status transition validator utility in `src/modules/support/enums/dispute-status.enum.ts` enforcing the DAG from data-model.md
- [ ] T025 [US2] Add the following endpoints to `SupportController`: `POST /support/disputes`, `GET /support/disputes`, `GET /support/disputes/:id`
- [ ] T026 [US2] Add Swagger decorators to all US2 endpoints with request/response examples from contracts/README.md
- [ ] T027 [US2] Wire audit logging in DisputesService — log dispute creation action to `AuditLog`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 — Admin Resolves a Dispute (Priority: P1)

**Goal**: An admin can review an open dispute and resolve it in favor of either the customer or provider, with resolution notes and status update.

**Independent Test**: Admin calls PATCH /admin/support/disputes/:id/resolve with resolution body → dispute status changes to resolved_customer or resolved_provider → GET /admin/support/disputes shows updated status.

- [ ] T028 [P] [US3] Implement `resolve(id, resolveDto, adminId)` logic in `DisputesService` enforcing: dispute must be in resolvable state (under_review or awaiting_evidence), status changes to resolved_customer/resolved_provider, sets resolution/resolvedBy/resolvedAt, triggers notification event
- [ ] T029 [US3] Implement `AdminSupportController` in `src/modules/support/admin-support.controller.ts` — create dedicated admin controller with admin role guard
- [ ] T030 [US3] Add endpoint `PATCH /admin/support/disputes/:id/resolve` to `AdminSupportController`
- [ ] T031 [US3] Add Swagger decorators to US3 endpoint with request/response examples
- [ ] T032 [US3] Wire audit logging — log dispute resolution action (old status, new status, resolution outcome, favored party)

**Checkpoint**: Core P1 stories complete — all primary workflows functional

---

## Phase 6: User Story 4 — Customer Replies to Ticket Conversation (Priority: P2)

**Goal**: A customer can add messages to an existing open ticket conversation.

**Independent Test**: Create ticket → POST /support/tickets/:id/messages with message body → GET /support/tickets/:id returns ticket with messages[] array containing the new message.

- [ ] T033 [US4] Implement `TicketMessagesService` in `src/modules/support/services/ticket-messages.service.ts` with methods: `create(ticketId, senderId, message)` with ticket status validation (message only allowed on open/in_progress/waiting_for_user tickets), `findByTicketId(ticketId)`
- [ ] T034 [US4] Add endpoint `POST /support/tickets/:id/messages` to `SupportController` with ownership guard
- [ ] T035 [US4] Modify `GET /support/tickets/:id` response in TicketsService to include nested `messages[]` array using TicketMessagesService
- [ ] T036 [US4] Add Swagger decorators to US4 endpoint
- [ ] T037 [US4] Wire audit logging for new messages (optional — log may be omitted for regular messages, but message content is stored permanently in ticket_messages table)

**Checkpoint**: Ticket conversation workflow functional

---

## Phase 7: User Story 5 — Admin Manages Support Ticket Queue (Priority: P2)

**Goal**: An admin can view all tickets, filter by status/category/priority, change ticket status, assign priority, and claim ownership.

**Independent Test**: Admin calls GET /admin/support/tickets → sees all tickets → PATCH /admin/support/tickets/:id/status with new status → ticket status updates → invalid transition is rejected.

- [ ] T038 [P] [US5] Add `updatePriority(ticketId, priority, adminId)` and `assignAdmin(ticketId, adminId)` methods to `TicketsService`
- [ ] T039 [US5] Add endpoints to `AdminSupportController`: `GET /admin/support/tickets` (with full filtering), `PATCH /admin/support/tickets/:id/status`
- [ ] T040 [US5] Add Swagger decorators to US5 endpoints with query parameter documentation for filtering
- [ ] T041 [US5] Wire audit logging for ticket status/priority changes — log old and new values

**Checkpoint**: Admin ticket management functional

---

## Phase 8: User Story 6 — Provider Uploads Dispute Evidence (Priority: P2)

**Goal**: A provider can upload evidence files (images, PDFs, documents) to support their dispute, with file type and size validation.

**Independent Test**: Create dispute → POST /support/disputes/:id/evidence with multipart file → receive 201 with file metadata → GET /support/disputes/:id returns dispute with evidence[] array.

- [ ] T042 [P] [US6] Implement `DisputeEvidenceService` in `src/modules/support/services/dispute-evidence.service.ts` with methods: `upload(disputeId, uploadedBy, file)` with file type validation (jpg, jpeg, png, gif, webp, pdf, doc, docx) and size validation (images: 10MB, docs: 25MB), `findByDisputeId(disputeId)`, storage integration via existing `StorageProvider` interface
- [ ] T043 [US6] Add endpoint `POST /support/disputes/:id/evidence` to `SupportController` with multipart file handling and dispute-participant guard (admins also allowed)
- [ ] T044 [US6] Modify `GET /support/disputes/:id` response in DisputesService to include nested `evidence[]` array using DisputeEvidenceService
- [ ] T045 [US6] Add Swagger decorators to US6 endpoint with `@ApiConsumes('multipart/form-data')`
- [ ] T046 [US6] Wire audit logging for evidence uploads — log file type, file URL, and dispute ID

**Checkpoint**: All user stories functional

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T047 [P] Create `support-events.handler.ts` in `src/modules/notifications/handlers/support-events.handler.ts` following the existing handler pattern — handle events: TicketCreated, TicketUpdated, TicketMessageAdded, DisputeOpened, DisputeResolved, TicketClosed; emit events from TicketsService and DisputesService
- [ ] T048 [P] Finalize Swagger documentation across all controllers — verify all endpoints have complete `@ApiOperation` summaries, `@ApiResponse` (200, 201, 400, 401, 403, 404) with examples, and `@ApiBearerAuth`
- [ ] T049 Run quickstart.md validation steps — entity creation, migration, module wiring, guard configuration, notification handler integration
- [ ] T050 Generate integration notes documenting: module dependencies (Auth, Bookings, Notifications, Uploads), guard requirements, event contracts for notification integration

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (P1 → P2)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 3 (P1)**: Depends on US2 (dispute must exist to resolve it)
- **User Story 4 (P2)**: Depends on US1 (ticket must exist to message it)
- **User Story 5 (P2)**: Depends on US1 (tickets must exist to manage them)
- **User Story 6 (P2)**: Depends on US2 (dispute must exist to upload evidence)

### Within Each User Story

- Models and entities before services
- Services before controllers
- Controllers before Swagger decoration
- Audit logging wired as part of service implementation
- Story complete before moving to next phase

### Parallel Opportunities

- All Phase 1 Setup tasks marked [P] can run in parallel
- All Phase 2 Foundational entity tasks (T003-T006) marked [P] can run in parallel
- All Phase 2 DTO tasks (T008-T011) marked [P] can run in parallel
- All Phase 2 guard tasks (T012-T013) marked [P] can run in parallel
- Different user stories depend on shared services but have distinct controllers and service methods, allowing parallel work on separate service method implementations
- Phase 9 Polish tasks marked [P] (T047-T048) can run in parallel

---

## Parallel Example: Phase 2 Foundational

```bash
# Launch all entity creation in parallel:
Task: "T003 Create SupportTicket entity in src/entities/support-ticket.entity.ts"
Task: "T004 Create TicketMessage entity in src/entities/ticket-message.entity.ts"
Task: "T005 Create Dispute entity in src/entities/dispute.entity.ts"
Task: "T006 Create DisputeEvidence entity in src/entities/dispute-evidence.entity.ts"

# Launch all DTO creation in parallel:
Task: "T008 Create base DTOs in src/modules/support/dto/"
Task: "T009 Create dispute DTOs in src/modules/support/dto/"
Task: "T010 Create admin DTOs in src/modules/support/dto/"
Task: "T011 Create filter DTOs in src/modules/support/dto/"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (Customer creates support ticket)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - POST /support/tickets → 201 with ticketNumber
   - GET /support/tickets → lists created ticket
   - GET /support/tickets/:id → returns full details
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Phases 1-2 → Foundation ready
2. Add US1 (Customer Creates Ticket) → Test independently → Deploy/Demo (MVP)
3. Add US2 (Provider Opens Dispute) → Test independently → Deploy/Demo
4. Add US3 (Admin Resolves Dispute) → Test independently → Deploy/Demo
5. Add US4-6 (Messaging, Queue Management, Evidence) → Test → Deploy/Demo
6. Add US9 (Polish — Notifications, Swagger finalization) → Finalize

### Parallel Team Strategy

With multiple developers:

1. Team completes Phases 1-2 together
2. Once Foundational is done:
   - Developer A: US1 (ticket creation + messaging)
   - Developer B: US2 + US3 (dispute creation + resolution)
   - Developer C: US5 (admin queue management)
3. Developers A and B split US4/US6 sub-tasks as available
4. Notifications handler (T047) can be done in parallel by any developer familiar with the notifications module pattern

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- Total task count: 50
- P1 tasks: 17 (T016-T032)
- P2 tasks: 14 (T033-T046)
- Foundational: 13 (T003-T015)
- Polish: 4 (T047-T050)
