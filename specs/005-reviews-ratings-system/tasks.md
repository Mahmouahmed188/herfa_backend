---
description: "Task list for Reviews & Ratings System feature implementation"
---

# Tasks: Reviews & Ratings System

**Input**: Design documents from `specs/005-reviews-ratings-system/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks generated. Independent test criteria documented per story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single NestJS project: `src/` at repository root
- Entities: `src/entities/`
- Module: `src/modules/reviews/`
- Shared: `src/common/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify environment and branch readiness

- [X] T001 Verify working on feature branch `005-reviews-ratings-system` and dev server (`npm run start:dev`) starts without errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core entities, DTOs, module structure, and guards. MUST complete before ANY user story.

- [X] T002 [P] Extend `src/entities/review.entity.ts` — add `bookingId` (FK → Booking with unique constraint), `booking` relation, `customerId`/`customer` relation, `providerId`/`provider` relation, `editableUntil` timestamp, `removedByAdmin` boolean, `adminRemovalReason` text, `removedAt` timestamp, `updatedAt` column. Keep `jobId`/`job`/`type`/`images` for backward compat. Add indexes on `bookingId`, `customerId`, and composite index on `[providerId, isVisible, createdAt]`
- [X] T003 [P] Create `src/entities/provider-rating-stats.entity.ts` with `@Entity('provider_rating_stats')` — fields: id (uuid PK), providerId (unique FK→provider_profiles), provider (OneToOne), averageRating (decimal 3,2), totalReviews (int), fiveStarCount, fourStarCount, threeStarCount, twoStarCount, oneStarCount (all int default 0), updatedAt. Index on averageRating
- [X] T004 [P] Create `src/entities/moderation-log.entity.ts` with `@Entity('moderation_logs')` — fields: id (uuid PK), reviewId (FK→reviews, indexed), review (ManyToOne), adminId (FK→users, indexed), admin (ManyToOne), action (varchar), reason (text, nullable), createdAt. Index on createdAt
- [X] T005 [P] Create `src/modules/reviews/dto/create-review.dto.ts` with class-validator (`@IsUUID`, `@IsInt`, `@Min(1)`, `@Max(5)`, `@IsOptional`, `@IsString`, `@MaxLength(1000)`) and `@nestjs/swagger` (`@ApiProperty`, `@ApiPropertyOptional`) decorators per DTO contracts
- [X] T006 [P] Create `src/modules/reviews/dto/update-review.dto.ts` with optional rating and comment fields, validation, and Swagger decorators
- [X] T007 [P] Create `src/modules/reviews/dto/review-response.dto.ts` with id, bookingId, customerId, customerName, customerAvatar, providerId, rating, comment, isEditable, createdAt, updatedAt — all with `@ApiProperty` with descriptions
- [X] T008 [P] Create `src/modules/reviews/dto/review-filter.dto.ts` extending `PaginationDto` from `src/common/dto/pagination.dto.ts` — add optional sortBy (`ReviewSortBy` enum), sortOrder (`SortOrder` enum from PaginationDto), rating filter (int 1-5). Add `@IsEnum` and `@ApiPropertyOptional` decorators
- [X] T009 [P] Create `src/modules/reviews/dto/provider-rating-stats-response.dto.ts` with providerId, averageRating, totalReviews, fiveStarCount, fourStarCount, threeStarCount, twoStarCount, oneStarCount — all with `@ApiProperty`
- [X] T010 [P] Create `src/modules/reviews/dto/moderation-log-response.dto.ts` with id, reviewId, adminId, adminName, action, reason, createdAt — all with `@ApiProperty`
- [X] T011 [P] Add `ReviewSortBy` enum (`DATE = 'date'`, `RATING = 'rating'`) to `src/common/constants/user.enums.ts`
- [X] T012 [P] Create `src/modules/reviews/events/review.events.ts` — export `ReviewEventPayload` interface matching contracts (`event: string`, `timestamp: string`, `data: { reviewId, bookingId, customerId, providerId, rating, comment? }`, `reason?`)
- [X] T013 Update `src/modules/reviews/reviews.module.ts` — add `TypeOrmModule.forFeature([ProviderRatingStats, ModerationLog, Booking])`, import `BookingsModule` (or `forwardRef` if circular), update exports
- [X] T014 [P] Create `src/modules/reviews/guards/review-ownership.guard.ts` implementing `CanActivate` — extract `reviewId` from request params, query review from DB, verify `review.customerId === user.id` (customer) or `user.role === 'admin'` (admin override). Use `@InjectRepository(Review)` and `Reflector`

**Checkpoint**: Foundation ready — entities, DTOs, module, guard, event types all defined. User story implementation can begin.

---

## Phase 3: User Story 1 — Customer submits a review after completed service (Priority: P1) 🎯 MVP

**Goal**: Customer can submit a rating (1-5) with optional comment for a completed booking they own. Stats auto-update. Duplicates prevented.

**Independent Test**: Complete a booking → POST /reviews (JWT as customer) with rating 4 and comment → verify 201 response with review data → verify provider stats reflect new rating. Then POST same booking again → verify 409 duplicate error.

- [X] T015 [US1] Implement `ReviewsService.create()` in `src/modules/reviews/reviews.service.ts` — validate booking exists + status completed (FR-001), verify booking.customerId matches authenticated user (FR-002), check no existing review for this booking (FR-003), create and save review with `editableUntil = now + 24h`, call `updateProviderRatingStats()`, emit `review.created` event, return saved review
- [X] T016 [US1] Implement private `ReviewsService.updateProviderRatingStats(providerId)` — use TypeORM query builder to calculate AVG(rating), COUNT(*), per-star FILTER counts from visible reviews WHERE providerId matches. Upsert into `ProviderRatingStats`. Also update `ProviderProfile.rating` with the new average for backward compat (FR-022)
- [X] T017 [US1] Implement `ReviewsService.findAllByCustomer(customerId, filter)` and `ReviewsService.findOne(id)` in `src/modules/reviews/reviews.service.ts` — with pagination, sorting by date/rating, and rating filter support. Only return visible (isVisible=true) reviews
- [X] T018 [US1] Rewrite `src/modules/reviews/reviews.controller.ts` as `ReviewsController` with `@Controller('reviews')`, `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(UserRole.CUSTOMER)` — endpoints: `POST /` (create), `GET /mine` (list my reviews), `GET /:id` (get one). Wire to service methods. Add `@ApiTags`, `@ApiBearerAuth`, `@ApiOperation` summaries, and response examples matching contracts

**Checkpoint**: US1 complete — customer review submission works end-to-end. Provider stats update on creation. Duplicate review prevention works. ✅ MVP achievable with just this phase.

---

## Phase 4: User Story 2 — Provider views their ratings and reviews (Priority: P2)

**Goal**: Provider dashboard showing all received reviews with pagination, plus rating statistics (avg, total, star distribution).

**Independent Test**: Have reviews for a provider → GET /provider/reviews (JWT as provider) → verify paginated review list returned. GET /provider/reviews/stats → verify avg, total, distribution match submitted reviews.

- [X] T019 [P] [US2] Implement `ReviewsService.getProviderReviews(providerId, filter)` in `src/modules/reviews/reviews.service.ts` — query reviews WHERE providerId matches with pagination, sorting, and rating filter. Only visible reviews
- [X] T020 [P] [US2] Implement `ReviewsService.getProviderStats(providerId)` — fetch `ProviderRatingStats` by providerId, return as `ProviderRatingStatsResponseDto`. Handle zero-reviews case (return zero values)
- [X] T021 [US2] Create `src/modules/reviews/provider-reviews.controller.ts` as `ProviderReviewsController` with `@Controller('provider/reviews')`, `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(UserRole.PROVIDER)` — endpoints: `GET /` (list received reviews), `GET /stats` (rating stats). Add Swagger documentation
- [X] T022 [US2] Register `ProviderReviewsController` in `src/modules/reviews/reviews.module.ts`

**Checkpoint**: US2 complete — provider can see their reviews and stats independently.

---

## Phase 5: User Story 3 — Public views a provider's reviews and rating (Priority: P2)

**Goal**: Unauthenticated users browsing provider profiles can see their rating and paginated reviews.

**Independent Test**: Navigate to GET /providers/:providerId/reviews (no auth) → verify paginated reviews sorted by date. GET /providers/:providerId/rating (no auth) → verify avg and distribution. Provider with no reviews → zero values returned.

- [X] T023 [P] [US3] Implement `ReviewsService.getPublicProviderReviews(providerId, filter)` and `ReviewsService.getPublicProviderStats(providerId)` — same queries as provider stories but scoped to `isVisible=true` only and no auth checks. Ensure zero-reviews case returns zero values
- [X] T024 [US3] Create `src/modules/reviews/public-reviews.controller.ts` as `PublicReviewsController` with `@Controller('providers')` — endpoints: `GET /:providerId/reviews` (paginated list), `GET /:providerId/rating` (stats). NO JWT guards. Add `@ApiOperation` with summaries and `@ApiTags('Provider Reviews (Public)')`
- [X] T025 [US3] Register `PublicReviewsController` in `src/modules/reviews/reviews.module.ts`

**Checkpoint**: US3 complete — public provider profile shows reviews and ratings without authentication.

---

## Phase 6: User Story 4 — Admin moderates reviews (Priority: P3)

**Goal**: Admin can view all reviews, remove abusive ones (flagged as removed, not deleted), the action is logged, and provider stats are recalculated.

**Independent Test**: Admin logs in → GET /admin/reviews → see all reviews. DELETE /admin/reviews/:id with reason → verify review hidden from public, stats recalculated, moderation log entry created. GET /admin/reviews/moderation-log → see log entry.

- [X] T026 [P] [US4] Implement `ReviewsService.adminFindAll(filter)` — query all reviews regardless of isVisible, with pagination and filters
- [X] T027 [P] [US4] Implement `ReviewsService.adminRemoveReview(reviewId, adminId, reason)` — set `isVisible = false`, `removedByAdmin = true`, `adminRemovalReason`, `removedAt`. Create `ModerationLog` entry (action: 'removed'). Call `updateProviderRatingStats()`. Emit `review.removed` event
- [X] T028 [P] [US4] Implement `ReviewsService.getModerationLog(filter)` — query `ModerationLog` with pagination, join admin user for name, return as `ModerationLogResponseDto`
- [X] T029 [US4] Create `src/modules/reviews/admin-reviews.controller.ts` as `AdminReviewsController` with `@Controller('admin/reviews')`, `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)` — endpoints: `GET /` (list all), `GET /:id` (get one), `DELETE /:id` (remove with body: `{ reason }`), `GET /moderation-log` (view logs). Add Swagger documentation
- [X] T030 [US4] Register `AdminReviewsController` in `src/modules/reviews/reviews.module.ts`

**Checkpoint**: US4 complete — admin moderation, audit logging, and stats recalculation work.

---

## Phase 7: User Story 5 — Customer edits their review (Priority: P3)

**Goal**: Customer can update rating/comment within 24-hour window. Changes reflected in stats after edit.

**Independent Test**: Submit a review → PATCH /reviews/:id (JWT as customer) with new rating within 24h → verify updated content. PATCH same review after 24h window → verify 400 error.

- [X] T031 [US5] Implement `ReviewsService.update(reviewId, userId, dto)` — find review, verify `review.customerId === userId`, verify `now < editableUntil` (24h window), update rating/comment fields, save, call `updateProviderRatingStats()`, emit `review.updated` event
- [X] T032 [US5] Add `PATCH /:id` endpoint to `ReviewsController` — wire to `update()`, add Swagger documentation. `ReviewOwnershipGuard` handles ownership check at controller level (or inline in service)

**Checkpoint**: US5 complete — customer can edit their review within the time window.

---

## Phase 8: User Story 6 — Customer deletes their review (Priority: P3)

**Goal**: Customer can hard-delete their review within 24-hour window. Stats recalculated after deletion.

**Independent Test**: Submit a review → DELETE /reviews/:id (JWT as customer) within 24h → verify 204 response. GET that review → verify 404. Provider stats exclude the deleted review.

- [X] T033 [US6] Implement `ReviewsService.delete(reviewId, userId)` — find review, verify ownership, verify `now < editableUntil`, hard-delete from DB, call `updateProviderRatingStats()`, emit `review.removed` event with `reason: 'customer_deleted'`
- [X] T034 [US6] Add `DELETE /:id` endpoint to `ReviewsController` — wire to `delete()`, return 204, add Swagger documentation

**Checkpoint**: US6 complete — customer can delete their review within the window.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, provider profile sync, documentation, and validation.

- [X] T035 [P] Verify `ProviderProfile.rating` sync — ensure `updateProviderRatingStats()` always writes the new average to `ProviderProfile.rating` column (FR-022)
- [X] T036 [P] Verify entities are auto-registered — confirm `Review`, `ProviderRatingStats`, `ModerationLog` are discovered by TypeORM glob pattern (entities auto-loaded from `src/entities/*.entity.ts` in dev and `**/*.entity.ts` in prod)
- [X] T037 Run full build check: `npm run build` — confirm no TypeScript compilation errors
- [X] T038 Run quickstart.md validation — verify all 8 endpoints respond correctly, all 5 acceptance scenarios for US1 pass
- [X] T039 Verify all unused Review entity fields (`jobId`, `job`, `type`, `images`) remain intact for backward compatibility

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 Customer submits review (Phase 3)**: Depends on Phase 2 — No dependencies on other stories ⭐ MVP
- **US2 Provider views (Phase 4)**: Depends on Phase 2 — Requires existing reviews (from US1) for meaningful testing, but implementation is independent
- **US3 Public views (Phase 5)**: Depends on Phase 2 — Independent of all stories (reads only)
- **US4 Admin moderates (Phase 6)**: Depends on Phase 2 — Independent implementation (reads + admin-writes)
- **US5 Customer edits (Phase 7)**: Depends on Phase 3 (US1) — Reuses create logic and extends with update
- **US6 Customer deletes (Phase 8)**: Depends on Phase 3 (US1) — Reuses create logic and extends with delete
- **Polish (Phase 9)**: Depends on all user stories being complete

### Within Each User Story

- Entities/DTOs/guards completed in Foundational Phase
- Service methods before controller endpoints
- Swagger documentation with each endpoint
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel (T002–T014 are independent files)
- US1, US2, US3, US4 can all start in parallel after Phase 2 completes (they edit different service methods and controller files)
- US5 and US6 depend on US1 but are independent of each other
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all entity tasks together:
Task: "Extend src/entities/review.entity.ts"
Task: "Create src/entities/provider-rating-stats.entity.ts"
Task: "Create src/entities/moderation-log.entity.ts"

# Launch all DTO tasks together:
Task: "Create create-review.dto.ts"
Task: "Create update-review.dto.ts"
Task: "Create review-response.dto.ts"
Task: "Create review-filter.dto.ts"
Task: "Create provider-rating-stats-response.dto.ts"
Task: "Create moderation-log-response.dto.ts"

# Launch remaining independent tasks:
Task: "Add ReviewSortBy enum to user.enums.ts"
Task: "Create events/review.events.ts"
Task: "Create guards/review-ownership.guard.ts"
```

## Parallel Example: User Story Phases (after Foundational)

```bash
# Phase 3 (US1) and Phase 4 (US2) can run in parallel on different service files:
Task: "[US1] Implement ReviewsService.create()"
Task: "[US2] Implement ReviewsService.getProviderReviews()"

# US5 and US6 depend on US1, but are independent of each other:
Task: "[US5] Implement ReviewsService.update()"
Task: "[US6] Implement ReviewsService.delete()"
```

---

## Implementation Strategy

### MVP First (User Stories 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (customer submits review)
4. **STOP and VALIDATE**: Test US1 independently — create review, check stats, check duplicate prevention
5. Deploy/demo if ready — providers get reviews capability

### Incremental Delivery

1. **MVP** (Phase 1 + 2 + 3): Customers can submit reviews → provider stats update automatically
2. **Provider Visibility** (Phase 4): Providers see their reviews and stats on dashboard
3. **Public Trust** (Phase 5): Public browsing shows rating — drives marketplace trust
4. **Moderation** (Phase 6): Admin can remove abusive content — trust & safety
5. **Customer Self-Service** (Phase 7 + 8): Customers can edit/delete their own reviews

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + Phase 2 together (all hands on foundational)
2. Once Foundational is done:
   - Developer A: US1 (customer submit) + US5 (edit) + US6 (delete)
   - Developer B: US2 (provider views) + US3 (public views)
   - Developer C: US4 (admin moderation)
3. Phase 9: Polish — last dev standing handles final checks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to a specific user story for traceability
- Each user story should be independently completable and testable
- Tests were not requested — no test tasks included
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Stats recalculation (T016) is shared by US1, US4, US5, US6
- Event emission (helper in T015) is shared by US1, US4, US5, US6
- All entities auto-discovered by TypeORM glob pattern — no migration step needed (synchronize: true)
