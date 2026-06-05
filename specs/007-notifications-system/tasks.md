---

description: "Task list for Notifications System implementation"
---

# Tasks: Notifications System

**Input**: Design documents from `specs/007-notifications-system/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests included per Constitution P15 step 10 and spec deliverables.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single NestJS project. Source at `src/`, tests in spec files colocated next to source files (`*.spec.ts`).
- E2E tests in `test/`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Update existing project configuration, install any new dependencies, and establish the directory structure for the enhanced notifications module.

- [x] T001 [P] Add `notification-announcement.entity.ts` to `src/entities/` with fields: id (UUID), title, message, targetAudience, targetUserId (nullable), createdBy, createdAt
- [x] T002 [P] Add `notification_announcements` model to `prisma/schema.prisma` mirroring the TypeORM entity
- [x] T003 [P] Create `handlers/` and `channels/` subdirectories in `src/modules/notifications/`
- [x] T004 [P] Update `notifications_type_enum` in `prisma/schema.prisma` to include: booking_created, booking_accepted, booking_rejected, booking_on_the_way, booking_in_progress, booking_completed, booking_cancelled, account_verified, account_suspended, refund_processed (in addition to existing values)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented. Aligns with Constitution P15 steps 2-4.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 [P] Update `NotificationType` enum in `src/common/constants/user.enums.ts` to match spec categories: Booking, Review, Payment, Account, System (map to full event names)
- [x] T006 [P] Add `relatedEntityType` (nullable VARCHAR) and `relatedEntityId` (nullable VARCHAR) columns to `notification.entity.ts`
- [x] T007 [P] Add `relatedEntityType` and `relatedEntityId` fields to Prisma `notifications` model in `schema.prisma`
- [x] T008 [P] Generate TypeORM migration for Notification entity changes (relatedEntityType, relatedEntityId) and new NotificationAnnouncement entity
- [x] T009 [P] Generate Prisma migration for schema changes
- [x] T010 [P] Create `NotificationTargetAudience` enum in `src/common/constants/notification.enums.ts` with values: all, customers, providers, individual
- [x] T011 [P] Create `NotificationChannel` interface in `src/modules/notifications/channels/notification-channel.interface.ts` with `name` property and `send(notification, user): Promise<void>` method
- [x] T012 [P] Create `InAppChannel` implementation in `src/modules/notifications/channels/in-app.channel.ts` that persists notification via TypeORM
- [x] T013 [P] Create `CreateAnnouncementDto` in `src/modules/notifications/dto/announcements.dto.ts` with title (required), message (required), targetAudience (required enum), targetUserId (optional UUID) with class-validator and Swagger decorators
- [x] T014 [P] Create `AnnouncementResponseDto` in `src/modules/notifications/dto/announcements.dto.ts` with all announcement fields and Swagger examples
- [x] T015 [P] Create `AnnouncementListResponseDto` in `src/modules/notifications/dto/announcements.dto.ts` with items array and total count
- [x] T016 [P] Update `NotificationQueryDto` in `src/modules/notifications/dto/notifications.dto.ts` to add optional `type` (enum), `startDate` (ISO date), `endDate` (ISO date) filter fields
- [x] T017 [P] Create `notification-announcement.entity.ts` TypeORM entity with fields: id (UUID PK), title, message, targetAudience (enum), targetUserId (nullable UUID), createdBy (VARCHAR), createdAt (timestamp)

**Checkpoint**: Foundation ready — all entities, DTOs, channels, and migrations are prepared. User story implementation can now begin.

---

## Phase 3: User Story 1 - View and Manage Personal Notifications (Priority: P1) 🎯 MVP

**Goal**: Users can view their paginated notification list, see unread count, mark individual notifications as read, and mark all notifications as read.

**Independent Test**: Authenticate a user with pre-existing notifications, retrieve the list, verify unread count, mark one as read, mark all as read, and confirm the count updates accordingly. This works entirely within the existing notification infrastructure without needing event generation.

### Implementation for User Story 1

- [x] T018 [US1] Add `markAllAsRead(userId: string)` method to `NotificationsService` in `src/modules/notifications/notifications.service.ts` that updates all unread notifications for the user to read=true
- [x] T019 [US1] Add `PATCH /notifications/:id/read` endpoint to `NotificationsController` in `src/modules/notifications/notifications.controller.ts` that marks a single notification as read (verify ownership)
- [x] T020 [US1] Add `PATCH /notifications/read-all` endpoint to `NotificationsController` that calls `markAllAsRead` for the authenticated user
- [x] T021 [US1] Update `findByUser` in `NotificationsService` to support filtering by `type`, `startDate`, `endDate` query parameters from the enhanced `NotificationQueryDto`
- [x] T022 [US1] Update `NotificationsModule` to register `InAppChannel` as a provider
- [x] T023 [US1] Add Swagger `@ApiOperation`, `@ApiResponse`, and `@ApiBearerAuth` decorators to all notification endpoints in the controller with request/response/error examples
- [x] T024 [US1] Create unit test for `NotificationsService` in `src/modules/notifications/notifications.service.spec.ts` testing: findByUser (paginated, filtered), markAsRead (single), markAllAsRead, getUnreadCount, and ownership enforcement
- [x] T025 [US1] Create unit test for `NotificationsController` in `src/modules/notifications/notifications.controller.spec.ts` testing all endpoints with mocked service

**Checkpoint**: User Story 1 is fully functional. Users can view, filter, and manage their notification read status. This is the MVP.

---

## Phase 4: User Story 2 - Automatic Notification Generation (Priority: P1)

**Goal**: The system automatically generates notifications when events occur in other modules (booking, review, payment, account events). Integrates via `@nestjs/event-emitter` listeners.

**Independent Test**: Publish a `booking.accepted` event via EventEmitter2. Verify that a notification with correct title, message, type, and related entity reference is created in the database for the intended user. No UI or manual trigger needed.

### Implementation for User Story 2

- [x] T026 [P] [US2] Create `BookingEventsHandler` in `src/modules/notifications/handlers/booking-events.handler.ts` with `@OnEvent` listeners for: booking.created, booking.accepted, booking.rejected, booking.on.the.way, booking.in.progress, booking.completed, booking.cancelled — each constructs appropriate title/message and calls `NotificationsService.create()`
- [x] T027 [P] [US2] Create `ReviewEventsHandler` in `src/modules/notifications/handlers/review-events.handler.ts` with `@OnEvent('review.submitted')` listener
- [x] T028 [P] [US2] Create `PaymentEventsHandler` in `src/modules/notifications/handlers/payment-events.handler.ts` with `@OnEvent` listeners for: payment.received, payment.failed, payment.refunded
- [x] T029 [P] [US2] Create `AccountEventsHandler` in `src/modules/notifications/handlers/account-events.handler.ts` with `@OnEvent` listeners for: account.verified, account.suspended
- [x] T030 [US2] Update `NotificationsModule` to register all four event handlers as providers
- [x] T031 [US2] Update `NotificationsService.create()` to delegate to `InAppChannel.send()` instead of directly saving — ensuring the channel interface is used
- [x] T032 [P] [US2] Create unit test for `BookingEventsHandler` in `src/modules/notifications/handlers/booking-events.handler.spec.ts`
- [x] T033 [P] [US2] Create unit test for `ReviewEventsHandler` in `src/modules/notifications/handlers/review-events.handler.spec.ts`
- [x] T034 [P] [US2] Create unit test for `PaymentEventsHandler` in `src/modules/notifications/handlers/payment-events.handler.spec.ts`
- [x] T035 [P] [US2] Create unit test for `AccountEventsHandler` in `src/modules/notifications/handlers/account-events.handler.spec.ts`

**Checkpoint**: User Stories 1 AND 2 are functional. Notifications are automatically generated from all platform events and users can view/manage them.

---

## Phase 5: User Story 3 - Admin Announcements (Priority: P2)

**Goal**: Admins can create announcements targeted at specific audiences (all users, all customers, all providers, or individual users). Announcements appear as notifications in recipients' inboxes.

**Independent Test**: Authenticate as admin, create an announcement targeting "all providers", verify that provider users receive a notification with the announcement title/message, and that customers do not. Admin can also list and delete announcements.

### Implementation for User Story 3

- [x] T036 [US3] Create `AnnouncementsController` in `src/modules/notifications/announcements.controller.ts` with endpoints: `POST /notifications/announcements` (create), `GET /notifications/announcements` (list), `DELETE /notifications/announcements/:id` (delete)
- [x] T037 [US3] Create `AnnouncementsService` in `src/modules/notifications/announcements.service.ts` with methods: `create(dto, adminId)`, `findAll()`, `delete(id)` — on create, resolve target audience to user IDs and call `NotificationsService.create()` for each
- [x] T038 [US3] Create `AnnouncementOwnershipGuard` in `src/modules/notifications/guards/announcement-ownership.guard.ts` that verifies the requesting user has admin role
- [x] T039 [US3] Add `@Roles(UserRole.ADMIN)` and `@UseGuards(RolesGuard)` to `AnnouncementsController` for admin-only access
- [x] T040 [US3] Add `NOTIFICATION_CREATED` logger call in `NotificationsService.create()` using NestJS Logger (Constitution P11)
- [x] T041 [US3] Wire `AnnouncementsController` and `AnnouncementsService` into `NotificationsModule`
- [x] T042 [US3] Add Swagger `@ApiTags('Notifications - Admin')`, `@ApiOperation`, `@ApiResponse`, and `@ApiBearerAuth` decorators to all announcement endpoints with request/response/error examples
- [x] T043 [US3] Create unit test for `AnnouncementsService` in `src/modules/notifications/announcements.service.spec.ts` testing create (all audience types), findAll, delete, and validation
- [x] T044 [US3] Create unit test for `AnnouncementsController` in `src/modules/notifications/announcements.controller.spec.ts`

**Checkpoint**: User Stories 1-3 are functional. Admins can manage announcements and targeted users receive them.

---

## Phase 6: User Story 4 - Notification Filtering and Search (Priority: P3)

**Goal**: Users can filter notifications by type, read status, and date range to quickly find relevant information.

**Independent Test**: Create notifications of different types and read statuses. Apply each filter individually and in combination. Verify the returned list matches the filter criteria precisely.

### Implementation for User Story 4

- [x] T045 [US4] Enhance `findByUser` query builder in `NotificationsService` to support combined filtering by type, isRead, startDate, endDate — all as optional AND conditions
- [x] T046 [US4] Update `NotificationsController.GET /notifications` to pass all query params to the enhanced `findByUser`
- [x] T047 [US4] Add pagination metadata (page, limit, total, totalPages) consistency check — confirm `NotificationsService.findByUser` returns standard pagination format matching the project convention `{ data, meta: { page, limit, total, totalPages } }`
- [x] T048 [US4] Add Swagger `@ApiQuery` decorators to the GET /notifications endpoint documenting all filter parameters (page, limit, type, isRead, startDate, endDate)
- [x] T049 [US4] Create unit test for filter combinations in `notifications.service.spec.ts` testing type+status, type+date, status+date, and all three combined filters

**Checkpoint**: All four user stories are functional. The notification system is complete with full filtering, pagination, and search capabilities.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T050 [P] Add structured error responses for notification endpoints: 401 (no token), 403 (marking another user's notification), 404 (notification not found), 422 (validation errors for announcements)
- [x] T051 [P] Add NestJS Logger calls to all event handlers logging notification creation events
- [x] T052 Add `NotificationsGateway` (existing WebSocket in `src/modules/tracking/`) integration — emit notification to user's socket room when `InAppChannel.send()` completes
- [x] T053 Add idempotency check in event handlers: skip notification creation if identical event (same event ID) processed within last 5 minutes
- [x] T054 Update `NotificationsGateway` to send notification payload to user's WebSocket room when notification is created
- [x] T055 Run full test suite to ensure no regressions: `npm test` and `npm run test:e2e`
- [x] T056 Update Swagger documentation with examples for all new and enhanced endpoints — verify docs at `/api/docs`
- [x] T057 Verify API contract compliance: all endpoints return standardized `{ data, timestamp }` response format

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — No story dependencies
- **User Story 2 (Phase 4)**: Depends on Foundational — No story dependencies on US1
- **User Story 3 (Phase 5)**: Depends on Foundational — No story dependencies on US1/US2
- **User Story 4 (Phase 6)**: Depends on Foundational, ideally after US1 (reuses/enhances same endpoints)
- **Polish (Phase 7)**: Depends on all user stories

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational — Independent from US1 but tested together end-to-end
- **User Story 3 (P2)**: Can start after Foundational — Independent from US1 and US2
- **User Story 4 (P3)**: Can start after Foundational — Enhances US1's GET /notifications endpoint

### Within Each User Story

- Models before services
- Services before controllers
- Tests before implementation (if following TDD)
- Core implementation before integration
- Story complete and independently testable before moving to next

### Parallel Opportunities

- All Setup tasks (T001-T004) can run in parallel
- All Foundational tasks (T005-T017) can run in parallel (independent files)
- Once Foundational phase completes: US1, US2, and US3 can start in parallel
- All event handler tasks (T026-T029) can run in parallel
- All test tasks within a story marked [P] can run in parallel
- US3 (admin announcements) has zero coupling to US1/US2 — fully parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all entity, DTO, and enum tasks together:
Task: "T005 Update NotificationType enum in user.enums.ts"
Task: "T006 Add relatedEntityType/relatedEntityId to notification.entity.ts"
Task: "T007 Add relatedEntity fields to Prisma schema"
Task: "T011 Create NotificationChannel interface"
Task: "T012 Create InAppChannel implementation"
Task: "T013 Create CreateAnnouncementDto"
Task: "T016 Update NotificationQueryDto with filter fields"
```

## Parallel Example: Event Handlers

```bash
# Launch all event handlers together (independent files):
Task: "T026 Create BookingEventsHandler"
Task: "T027 Create ReviewEventsHandler"
Task: "T028 Create PaymentEventsHandler"
Task: "T029 Create AccountEventsHandler"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test notification list, unread count, mark read, mark all read independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (view/manage notifications) → **MVP** → Deploy/Demo
3. Add User Story 2 (auto-generation from events) → Deploy/Demo
4. Add User Story 3 (admin announcements) → Deploy/Demo
5. Add User Story 4 (filtering/search) → Deploy/Demo
6. Phase 7 (polish, WebSocket, docs) → Finalize

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (notification CRUD)
   - Developer B: User Story 2 (event handlers — all 4 domains)
   - Developer C: User Story 3 (announcements — new entity, service, controller)
3. Developer A then picks up User Story 4 (filtering — enhances their US1 code)
4. Any developer handles Phase 7 polish tasks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- The existing NotificationsModule is already in production — ensure backward compatibility (no breaking changes to existing endpoints)
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
