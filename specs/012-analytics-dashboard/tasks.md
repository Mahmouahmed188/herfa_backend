# Tasks: Admin Dashboard & Analytics System

**Input**: Design documents from `specs/012-analytics-dashboard/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/README.md, quickstart.md

**Tests**: Not explicitly requested — Independent Test criteria serve as acceptance verification. No automated test file tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- All paths reference repository root

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and module directory structure

- [X] T001 Create analytics module directory structure per plan.md under src/modules/analytics/ with services/, dto/, enums/, jobs/ subdirectories
- [X] T002 [P] Install exceljs package for Excel report export via npm install exceljs

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database entities, migration, module boilerplate, DTOs, and shared services that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 [P] Create AnalyticsSnapshot entity in src/entities/analytics-snapshot.entity.ts with id (uuid PK), snapshotType (varchar), data (jsonb), generatedAt (timestamp), and indexes on (snapshotType), (generatedAt), (snapshotType, generatedAt)
- [X] T004 [P] Create AdminActivityLog entity in src/entities/admin-activity-log.entity.ts with id (uuid PK), adminId (uuid FK -> users.id), action (varchar), entityType (varchar nullable), entityId (uuid nullable), metadata (jsonb nullable), createdAt (timestamp), and indexes on (adminId), (action), (entityType), (createdAt), (adminId, createdAt)
- [X] T005 Generate TypeORM migration for analytics_snapshots and admin_activity_logs tables (requires live database - synchronize:true handles dev)
- [X] T006 [P] Create AdminAction enum in src/modules/analytics/enums/admin-action.enum.ts with values DASHBOARD_VIEW, REPORT_EXPORT, STATUS_UPDATE, SETTINGS_CHANGE, USER_ACTION, ALERT_VIEW
- [X] T007 Create all 12 DTO files in src/modules/analytics/dto/: DashboardOverviewDto, UserAnalyticsDto, ProviderAnalyticsDto, BookingAnalyticsDto, RevenueAnalyticsDto, ReviewAnalyticsDto, SupportAnalyticsDto, GeographicAnalyticsDto, DateRangeFilterDto, ReportFilterDto, ActivityLogDto, OperationalAlertDto with class-validator rules and Swagger decorators
- [X] T008 Create AnalyticsModule in src/modules/analytics/analytics.module.ts importing TypeOrmModule.forFeature([AnalyticsSnapshot, AdminActivityLog]), BullModule.registerQueue() for analytics-snapshot and alert-detection queues, and exporting all services
- [X] T009 Create ActivityLogService in src/modules/analytics/services/activity-log.service.ts with create() and findWithFilters() methods (paginated, filterable by action, adminId, entityType, dateRange)
- [X] T010 Configure error handling and structured error responses for analytics module with error codes: UNAUTHORIZED, FORBIDDEN, VALIDATION_ERROR, NOT_FOUND, REPORT_GENERATION_FAILED, SNAPSHOT_NOT_FOUND

**Checkpoint**: Foundation ready - user story implementation can now begin. Entities created, migration run, module registered, DTOs complete.

---

## Phase 3: User Story 1 - Admin Views Platform Overview Dashboard (Priority: P1) 🎯 MVP

**Goal**: Admin sees 13 widget metrics (total users, customers, providers, verified/active providers, total/active/completed/cancelled bookings, total revenue, pending payments, open tickets, active disputes) in a single dashboard overview endpoint.

**Independent Test**: Admin authenticates and navigates to GET /admin/dashboard/overview — all 13 widget values are returned with accurate counts matching the underlying data sources. Date range filtering scopes all metrics correctly.

### Implementation for User Story 1

- [X] T011 [P] [US1] Create DateRangeFilter utility service in src/modules/analytics/services/date-range-filter.service.ts with method to convert preset (today, last_7_days, last_30_days, last_90_days) and custom (startDate, endDate) filters to TypeORM Between conditions
- [X] T012 [P] [US1] Create DashboardService in src/modules/analytics/services/dashboard.service.ts with getOverview(dateFilter) method that queries userRepository.count(), provider counts (verified/active), booking counts (total/active/completed/cancelled), paymentRepository SUM for revenue and pending payments, supportTicketRepository.count() for open tickets, disputeRepository.count() for active disputes, all scoped by date filter
- [X] T013 [US1] Create analytics.controller.ts in src/modules/analytics/analytics.controller.ts with GET /admin/dashboard/overview endpoint, @UseGuards(JwtAuthGuard, RolesGuard), @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN), @ApiBearerAuth(), calling DashboardService.getOverview(), and logging the dashboard view via ActivityLogService
- [X] T014 [US1] Add @ApiTags('Admin - Dashboard'), @ApiOperation({ summary }), @ApiResponse() (200, 401, 403) Swagger decorators to dashboard overview endpoint in analytics.controller.ts

**Checkpoint**: Admin can view dashboard overview with all 13 live metrics. MVP is deliverable.

---

## Phase 4: User Story 2 - Admin Monitors User Growth and Engagement (Priority: P1)

**Goal**: Admin sees user registration trends, growth rates, and active/inactive user counts.

**Independent Test**: Admin requests GET /admin/dashboard/users — daily, weekly, monthly new user counts return sensible values; customer/provider growth rates are calculated correctly; active vs inactive counts match the platform state. Zero counts handled gracefully.

### Implementation for User Story 2

- [X] T015 [P] [US2] Create UserAnalyticsService in src/modules/analytics/services/user-analytics.service.ts with getAnalytics(dateFilter) method querying userRepository by role (customer/provider) for new users today/week/month, growth rate calculation (percentage change vs prior period), active/inactive counts based on lastLoginAt
- [X] T016 [US2] Add GET /admin/dashboard/users endpoint to analytics.controller.ts calling UserAnalyticsService.getAnalytics() with admin role guard and activity logging
- [X] T017 [US2] Add @ApiOperation and @ApiResponse Swagger decorators for user analytics endpoint in analytics.controller.ts

**Checkpoint**: User analytics endpoint returns growth and engagement data independently.

---

## Phase 5: User Story 3 - Admin Tracks Booking Performance (Priority: P1)

**Goal**: Admin sees booking volumes, status distribution, conversion rate, and average booking value.

**Independent Test**: Admin requests GET /admin/dashboard/bookings — daily, weekly, monthly counts returned; status distribution percentages sum to 100%; conversion rate and average booking value calculated correctly from source data.

### Implementation for User Story 3

- [X] T018 [P] [US3] Create BookingAnalyticsService in src/modules/analytics/services/booking-analytics.service.ts with getAnalytics(dateFilter) method using TypeORM QueryBuilder for booking counts grouped by date/week/month, status distribution percentages via GROUP BY status, conversion rate (completed/total), and AVG(amount) for average booking value
- [X] T019 [US3] Add GET /admin/dashboard/bookings endpoint to analytics.controller.ts calling BookingAnalyticsService.getAnalytics() with admin role guard and activity logging
- [X] T020 [US3] Add @ApiOperation and @ApiResponse Swagger decorators for booking analytics endpoint in analytics.controller.ts

**Checkpoint**: Booking analytics endpoint returns performance data independently.

---

## Phase 6: User Story 4 - Admin Monitors Revenue and Financial Metrics (Priority: P1)

**Goal**: Admin sees total revenue, time-based trends, category/provider breakdown, refund stats, and failed payment stats.

**Independent Test**: Admin requests GET /admin/dashboard/revenue — total revenue, daily/weekly/monthly revenue, revenue by category, revenue by provider, refund statistics, and failed payment statistics returned accurately. Date filtering scopes correctly.

### Implementation for User Story 4

- [X] T021 [P] [US4] Create RevenueAnalyticsService in src/modules/analytics/services/revenue-analytics.service.ts with getAnalytics(dateFilter) method querying paymentRepository for total SUM, GROUP BY DATE_TRUNC for time series, JOIN with service_categories for category breakdown, GROUP BY provider_id for provider breakdown, and separate queries for refund SUM/count and failed payment count/volume
- [X] T022 [US4] Add GET /admin/dashboard/revenue endpoint to analytics.controller.ts calling RevenueAnalyticsService.getAnalytics() with admin role guard and activity logging
- [X] T023 [US4] Add @ApiOperation and @ApiResponse Swagger decorators for revenue analytics endpoint in analytics.controller.ts

**Checkpoint**: Revenue analytics endpoint returns financial data independently.

---

## Phase 7: User Story 5 - Admin Reviews Provider Performance (Priority: P2)

**Goal**: Admin sees top providers by rating, bookings, and activity, plus verification status, completion, and cancellation rates.

**Independent Test**: Admin requests GET /admin/dashboard/providers — top rated, most booked, most active providers listed; verification status distribution correct; completion and cancellation rates calculated accurately. Zero rates handled for providers with no completed bookings.

### Implementation for User Story 5

- [X] T024 [P] [US5] Create ProviderAnalyticsService in src/modules/analytics/services/provider-analytics.service.ts with getAnalytics(dateFilter) method querying providerRepository for top-rated (ORDER BY rating DESC, bookingCount DESC), most-booked (ORDER BY bookingCount DESC), most-active (by lastActiveAt), verification status GROUP BY counts, completion rate (completed/total * 100), and cancellation rate (cancelled/total * 100)
- [X] T025 [US5] Add GET /admin/dashboard/providers endpoint to analytics.controller.ts calling ProviderAnalyticsService.getAnalytics() with admin role guard and activity logging
- [X] T026 [US5] Add @ApiOperation and @ApiResponse Swagger decorators for provider analytics endpoint in analytics.controller.ts

**Checkpoint**: Provider analytics endpoint returns performance data independently.

---

## Phase 8: User Story 6 - Admin Reviews Customer Satisfaction Metrics (Priority: P2)

**Goal**: Admin sees average platform rating, review volumes, top-rated categories, and rating distribution.

**Independent Test**: Admin requests GET /admin/dashboard/reviews — average platform rating, reviews per day/month, top rated categories (excluding categories with no reviews), and rating distribution histogram returned with accurate calculations.

### Implementation for User Story 6

- [X] T027 [P] [US6] Create ReviewAnalyticsService in src/modules/analytics/services/review-analytics.service.ts with getAnalytics(dateFilter) method querying reviewRepository for AVG(rating), COUNT grouped by DATE_TRUNC for daily/monthly counts, GROUP BY categoryId ORDER BY AVG(rating) DESC for top categories, and COUNT GROUP BY rating value (1-5) for distribution histogram
- [X] T028 [US6] Add GET /admin/dashboard/reviews endpoint to analytics.controller.ts calling ReviewAnalyticsService.getAnalytics() with admin role guard and activity logging
- [X] T029 [US6] Add @ApiOperation and @ApiResponse Swagger decorators for review analytics endpoint in analytics.controller.ts

**Checkpoint**: Review analytics endpoint returns satisfaction data independently.

---

## Phase 9: User Story 7 - Admin Monitors Support Performance (Priority: P2)

**Goal**: Admin sees open/resolved ticket counts, average resolution time, active dispute count, and dispute resolution rate.

**Independent Test**: Admin requests GET /admin/dashboard/support — open and resolved ticket counts, average resolution time (returns zero instead of division by zero when no resolved tickets), active dispute count, and dispute resolution rate calculated correctly.

### Implementation for User Story 7

- [X] T030 [P] [US7] Create SupportAnalyticsService in src/modules/analytics/services/support-analytics.service.ts with getAnalytics(dateFilter) method querying supportTicketRepository for COUNT by status (open/resolved), AVG resolution time using TIMESTAMPDIFF between createdAt and resolvedAt (returning 0 for empty sets), and disputeRepository for active COUNT and resolution rate (resolved/total * 100)
- [X] T031 [US7] Add GET /admin/dashboard/support endpoint to analytics.controller.ts calling SupportAnalyticsService.getAnalytics() with admin role guard and activity logging
- [X] T032 [US7] Add @ApiOperation and @ApiResponse Swagger decorators for support analytics endpoint in analytics.controller.ts

**Checkpoint**: Support analytics endpoint returns performance data independently.

---

## Phase 10: User Story 8 - Admin Views Geographic Activity Data (Priority: P3)

**Goal**: Admin sees platform activity broken down by city for users, providers, bookings, and revenue.

**Independent Test**: Admin requests GET /admin/dashboard/geographic — users by city, providers by city, bookings by city, and revenue by city returned with city-level breakdowns. Cities with no data are excluded from results.

### Implementation for User Story 8

- [X] T033 [P] [US8] Create GeographicAnalyticsService in src/modules/analytics/services/geographic-analytics.service.ts with getAnalytics(dateFilter) method querying user addresses GROUP BY city for user distribution, provider locations GROUP BY city, bookings JOIN addresses GROUP BY city for booking volumes, and payments JOIN bookings JOIN addresses GROUP BY city for revenue
- [X] T034 [US8] Add GET /admin/dashboard/geographic endpoint to analytics.controller.ts calling GeographicAnalyticsService.getAnalytics() with admin role guard and activity logging
- [X] T035 [US8] Add @ApiOperation and @ApiResponse Swagger decorators for geographic analytics endpoint in analytics.controller.ts

**Checkpoint**: Geographic analytics endpoint returns city-level data independently.

---

## Phase 11: User Story 9 - Admin Generates and Exports Reports (Priority: P3)

**Goal**: Admin generates paginated, filterable reports for users, providers, bookings, revenue, and payments, and exports as CSV or Excel.

**Independent Test**: Admin requests GET /admin/reports/users — paginated user data returned with meta (page, limit, total, totalPages). CSV export returns properly formatted file with headers. Excel export returns structured .xlsx file.

### Implementation for User Story 9

- [X] T036 [P] [US9] Create ReportService in src/modules/analytics/services/report.service.ts with getReport(type, filter) method providing paginated, sortable, filterable queries for each report type (users, providers, bookings, revenue, payments) returning { items, meta: { page, limit, total, totalPages } }
- [X] T037 [P] [US9] Add exportCSV() and exportXLSX() methods to ReportService in src/modules/analytics/services/report.service.ts using stream/pipeline for CSV and exceljs Workbook for XLSX, accepting report type and filters, returning file buffer with appropriate Content-Type header
- [X] T038 [US9] Create reports.controller.ts in src/modules/analytics/reports.controller.ts with GET /admin/reports/:type (paginated report) and GET /admin/reports/:type/export (CSV/XLSX download) endpoints, admin role guards, and activity logging for each export
- [X] T039 [US9] Add @ApiTags('Admin - Reports'), @ApiOperation, @ApiQuery for all filter/sort/pagination params, and @ApiResponse Swagger decorators in reports.controller.ts

**Checkpoint**: Report generation and export endpoints work independently.

---

## Phase 12: User Story 10 - Admin Views Activity Logs (Priority: P3)

**Goal**: Admin views paginated, filterable audit trail of all admin actions including dashboard views, report exports, and status changes.

**Independent Test**: Admin requests GET /admin/activity-logs — paginated log entries sorted by createdAt DESC. Filters by action type, entity type, adminId, and date range return only matching entries. New admin actions appear in logs immediately.

### Implementation for User Story 10

- [X] T040 [P] [US10] Add query methods to ActivityLogService in src/modules/analytics/services/activity-log.service.ts for findAll(filters) with pagination (page, limit), sorting (sortBy, sortOrder), and filters (adminId, action, entityType, dateFrom, dateTo)
- [X] T041 [US10] Create activity-logs.controller.ts in src/modules/analytics/activity-logs.controller.ts with GET /admin/activity-logs endpoint calling ActivityLogService.findAll(), admin role guards, and @ApiTags('Admin - Activity Logs') Swagger decorators
- [X] T042 [US10] Add @ApiOperation, @ApiQuery for all filter/sort/pagination params, and @ApiResponse Swagger decorators in activity-logs.controller.ts

**Checkpoint**: Activity log listing endpoint works independently.

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Background jobs (snapshot generation, alert detection), app module wiring, and validation.

- [X] T043 [P] Create AnalyticsSnapshotJob processor in src/modules/analytics/jobs/analytics-snapshot.job.ts with @Processor('analytics-snapshot') and @Process() methods for daily, weekly, and monthly snapshot generation using repeatable Bull jobs that compute all analytics and store in AnalyticsSnapshot entity
- [X] T044 [P] Create AlertDetectionJob processor in src/modules/analytics/jobs/alert-detection.job.ts with @Processor('alert-detection') and periodic job that checks configured thresholds via AlertService
- [X] T045 Create AlertService in src/modules/analytics/services/alert.service.ts with threshold configuration and check() method that evaluates booking failure rate, payment failures, refund volume, suspicious registrations, provider suspensions, and support ticket spikes against thresholds, creating OperationalAlertDto results
- [X] T046 Create AnalyticsSnapshotService in src/modules/analytics/services/analytics-snapshot.service.ts orchestrating all analytics services (UserAnalyticsService, BookingAnalyticsService, etc.) with computeAndStore(snapshotType) method that generates complete JSON snapshot and persists via AnalyticsSnapshot entity
- [X] T047 Wire AnalyticsModule into AppModule in src/app.module.ts by adding AnalyticsModule to the imports array
- [X] T048 Run quickstart.md validation: verify all 12 implementation steps are reflected in completed code, all endpoints respond correctly, and migration exists

**Checkpoint**: All features complete with background jobs and app wiring. Final validation passes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-12)**: All depend on Foundational phase completion
  - US2-US8 are independent of each other (each adds one endpoint + one service)
  - US1 (Dashboard) aggregates data directly from DB, independent of US2-US8
  - US9 (Reports) depends on existing data models but no analytics service dependencies
  - US10 (Activity Logs) depends on ActivityLogService from Foundational phase
- **Polish (Phase 13)**: Depends on all user stories (snapshot orchestrates all analytics; alert detection uses all metrics)

### User Story Dependencies

- **US1 Dashboard Overview (P1)**: Can start after Phase 2 — no story dependencies (direct DB queries)
- **US2 User Analytics (P1)**: Can start after Phase 2 — independent
- **US3 Booking Analytics (P1)**: Can start after Phase 2 — independent
- **US4 Revenue Analytics (P1)**: Can start after Phase 2 — independent
- **US5 Provider Analytics (P2)**: Can start after Phase 2 — independent
- **US6 Review Analytics (P2)**: Can start after Phase 2 — independent
- **US7 Support Analytics (P2)**: Can start after Phase 2 — independent
- **US8 Geographic Analytics (P3)**: Can start after Phase 2 — independent
- **US9 Reports (P3)**: Can start after Phase 2 — independent
- **US10 Activity Logs (P3)**: Can start after Phase 2 — independent

### Within Each User Story

- Service before controller
- Controller before Swagger decorators
- Story complete before moving to next phase

### Parallel Opportunities

- T002 (Setup) can run in parallel with T001
- T003, T004 (Foundational entities) can run in parallel
- T006, T007 can run in parallel
- All user story phases US2-US10 can run in parallel (once Phase 2 completes)
- Within a story: [P]-marked service tasks can run in parallel
- T043, T044 (Polish jobs) can run in parallel

---

## Parallel Example: US1 Dashboard Overview

```bash
# Launch both US1 service tasks in parallel:
Task: "T011 [US1] Create DateRangeFilter utility service"
Task: "T012 [US1] Create DashboardService with overview queries"

# Then sequentially:
Task: "T013 [US1] Create analytics.controller.ts dashboard endpoint"
Task: "T014 [US1] Add Swagger decorators"
```

## Parallel Example: US2-US8 All P1/P2 Stories

```bash
# Launch all P1/P2 services in parallel (different files, no cross-dependencies):
Task: "T015 [US2] Create UserAnalyticsService"
Task: "T018 [US3] Create BookingAnalyticsService"
Task: "T021 [US4] Create RevenueAnalyticsService"
Task: "T024 [US5] Create ProviderAnalyticsService"
Task: "T027 [US6] Create ReviewAnalyticsService"
Task: "T030 [US7] Create SupportAnalyticsService"

# Then add corresponding controller endpoints (same controller, sequential):
Task: "T016 [US2] Add user analytics route"
Task: "T019 [US3] Add booking analytics route"
# ... etc (sequential on same file)
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Dashboard Overview)
4. **STOP and VALIDATE**: Test GET /admin/dashboard/overview returns all 13 metrics
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 (Dashboard Overview) → Test independently → **Deploy/Demo (MVP!)**
3. Add US2 (User Analytics) → Test independently → Deploy/Demo
4. Add US3 (Booking Analytics) → Test independently → Deploy/Demo
5. Add US4 (Revenue Analytics) → Test independently → Deploy/Demo
6. Add US5 (Provider Analytics P2) → Test independently → Deploy/Demo
7. Add US6 (Review Analytics P2) → Test independently → Deploy/Demo
8. Add US7 (Support Analytics P2) → Test independently → Deploy/Demo
9. Add US8 (Geographic Analytics P3) → Test independently → Deploy/Demo
10. Add US9 (Reports P3) → Test independently → Deploy/Demo
11. Add US10 (Activity Logs P3) → Test independently → Deploy/Demo
12. Add Polish: background jobs, alert detection, wiring → Final

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + Phase 2 together
2. Once Phase 2 is done:
   - Developer A: US1 (Dashboard Overview) — MVP
   - Developer B: US2 (User Analytics) + US5 (Provider Analytics)
   - Developer C: US3 (Booking Analytics) + US6 (Review Analytics)
   - Developer D: US4 (Revenue Analytics) + US7 (Support Analytics)
3. Remaining P3 stories: US8, US9, US10 in parallel
4. Final: Polish phase (snapshots, alerts, wiring)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable via its endpoint
- No automated test tasks generated (spec defines Independent Test as acceptance criteria)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
