# Feature Specification: Admin Dashboard & Analytics System

**Feature Branch**: `012-analytics-dashboard`

**Created**: 2026-06-06

**Status**: Draft

**Input**: User description of Admin Dashboard & Analytics System

## User Scenarios & Testing

### User Story 1 - Admin Views Platform Overview Dashboard (Priority: P1)

An administrator opens the main dashboard and sees a high-level overview of platform activity with key performance indicators including user counts, booking metrics, revenue, pending payments, open support tickets, and active disputes.

**Why this priority**: The overview dashboard is the primary landing page for administrators and provides the most immediate value for monitoring platform health.

**Independent Test**: Admin authenticates and navigates to the dashboard overview endpoint — all 13 widget values are returned correctly with accurate counts matching the underlying data sources.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they request the dashboard overview, **Then** they receive all widget metrics (total users, customers, providers, verified providers, active providers, total bookings, active bookings, completed bookings, cancelled bookings, total revenue, pending payments, open tickets, active disputes)
2. **Given** the platform has new data since the last dashboard view, **When** the admin refreshes the dashboard, **Then** all widget values update to reflect the latest data
3. **Given** the admin selects a date filter (Today, Last 7 Days, Last 30 Days, Last 90 Days, or Custom Range), **When** the dashboard refreshes, **Then** all metrics are scoped to the selected time period

---

### User Story 2 - Admin Monitors User Growth and Engagement (Priority: P1)

An administrator views user analytics to track registration trends, growth rates, and engagement levels across customers and providers.

**Why this priority**: Understanding user growth and engagement is essential for business decisions and platform health monitoring.

**Independent Test**: Admin requests user analytics with various date filters — daily, weekly, and monthly new user counts return sensible values; growth rates are calculated correctly; active vs inactive user counts match the platform state.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they request user analytics, **Then** they receive new user counts (today, this week, this month), customer and provider growth rates, and active/inactive user counts
2. **Given** a date filter is applied, **When** the analytics are generated, **Then** all metrics are calculated within the specified date range
3. **Given** there are no new users in a period, **When** the admin views user analytics, **Then** the system returns zero counts gracefully rather than errors

---

### User Story 3 - Admin Tracks Booking Performance (Priority: P1)

An administrator views booking analytics to monitor booking volumes, status distribution, conversion rates, and average booking value across time periods.

**Why this priority**: Booking data is the core business metric and directly impacts revenue insights.

**Independent Test**: Admin requests booking analytics — daily, weekly, and monthly booking counts are returned; status distribution percentages sum to 100%; conversion rate and average booking value are calculated correctly from source data.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they request booking analytics, **Then** they receive total bookings, daily/weekly/monthly breakdowns, status distribution, conversion rate, and average booking value
2. **Given** there are bookings with different statuses, **When** the status distribution is calculated, **Then** the percentages for all statuses sum to 100%
3. **Given** a custom date range is selected, **When** booking analytics are generated, **Then** only bookings within that range are included

---

### User Story 4 - Admin Monitors Revenue and Financial Metrics (Priority: P1)

An administrator views revenue analytics to track platform earnings, revenue trends, category-based revenue, provider payouts, refunds, and payment failures.

**Why this priority**: Revenue analytics are critical for financial reporting and business performance tracking.

**Independent Test**: Admin requests revenue analytics — total revenue, daily/weekly/monthly revenue, revenue by category, revenue by provider, refund statistics, and failed payment statistics are returned accurately.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they request revenue analytics, **Then** they receive total revenue, time-based revenue breakdowns, revenue by category, revenue by provider, refund stats, and failed payment stats
2. **Given** a date filter is applied, **When** revenue data is calculated, **Then** only payments within the selected range are included
3. **Given** there are refunds and failed payments, **When** the admin views revenue analytics, **Then** refund statistics and failed payment statistics are shown separately from gross revenue

---

### User Story 5 - Admin Reviews Provider Performance (Priority: P2)

An administrator views provider analytics to identify top-performing providers, track verification status, and monitor completion and cancellation rates.

**Why this priority**: Provider performance data helps admins manage quality and identify issues with specific providers.

**Independent Test**: Admin requests provider analytics — top rated, most booked, and most active providers are listed; verification status distribution is shown; completion and cancellation rates are calculated correctly.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they request provider analytics, **Then** they receive top rated providers, most booked providers, most active providers, verification status breakdown, completion rate, and cancellation rate
2. **Given** a provider has no completed bookings, **When** their completion rate is calculated, **Then** the system returns zero rather than an error
3. **Given** providers are ranked by rating, **When** multiple providers have identical ratings, **Then** they are ordered by booking count as a tiebreaker

---

### User Story 6 - Admin Reviews Customer Satisfaction Metrics (Priority: P2)

An administrator views review analytics to monitor platform rating, review volumes, and rating distribution across categories.

**Why this priority**: Customer satisfaction data informs platform quality improvements.

**Independent Test**: Admin requests review analytics — average platform rating, reviews per day/month, top rated categories, and rating distribution are returned with accurate calculations.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they request review analytics, **Then** they receive average platform rating, reviews per day and per month, top rated categories, and rating distribution
2. **Given** there are no reviews in the selected period, **When** review analytics are generated, **Then** the average rating returns zero and review counts return zero
3. **Given** a category has no reviews, **When** top rated categories are calculated, **Then** that category is excluded from the ranking

---

### User Story 7 - Admin Monitors Support Performance (Priority: P2)

An administrator views support analytics to track open and resolved tickets, average resolution time, active disputes, and dispute resolution rates.

**Why this priority**: Support performance metrics help admins ensure customer issues are being addressed in a timely manner.

**Independent Test**: Admin requests support analytics — open ticket count, resolved ticket count, average resolution time, active dispute count, and dispute resolution rate are returned with accurate calculations.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they request support analytics, **Then** they receive open tickets, resolved tickets, average resolution time, active disputes, and dispute resolution rate
2. **Given** there are no resolved tickets, **When** average resolution time is calculated, **Then** the system returns zero instead of dividing by zero
3. **Given** a date filter is applied, **When** support analytics are generated, **Then** only tickets/disputes within the selected range are included

---

### User Story 8 - Admin Views Geographic Activity Data (Priority: P3)

An administrator views platform activity broken down by city, including user distribution, provider locations, booking volumes, and revenue by city.

**Why this priority**: Geographic data helps identify regional trends and opportunities, but is not critical for daily operations.

**Independent Test**: Admin requests geographic analytics — users by city, providers by city, bookings by city, and revenue by city are returned with city-level breakdowns.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they request geographic analytics, **Then** they receive users by city, providers by city, bookings by city, and revenue by city
2. **Given** there are no users registered in a particular city, **When** geographic data is generated, **Then** that city does not appear in the results

---

### User Story 9 - Admin Generates and Exports Reports (Priority: P3)

An administrator generates reports for users, providers, bookings, revenue, payments, reviews, and support tickets, and exports them as CSV or Excel files.

**Why this priority**: Report generation supports offline analysis and record-keeping but is secondary to real-time dashboard views.

**Independent Test**: Admin requests a user report — the system returns paginated user data that can be exported as CSV or Excel; the exported file contains the same data as the API response.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they request a user report with optional filters, **Then** the system returns paginated, sortable user data
2. **Given** an authenticated admin user, **When** they request CSV export of any report, **Then** the system generates a properly formatted CSV file with headers and data rows
3. **Given** the admin applies filters to a report, **When** the export is generated, **Then** the exported file only contains data matching the applied filters

---

### User Story 10 - Admin Views Activity Logs (Priority: P3)

An administrator views the audit trail of all administrative actions, dashboard accesses, and report generations with filtering and pagination.

**Why this priority**: Audit logging supports compliance and security monitoring but is not critical for daily platform management.

**Independent Test**: Admin requests activity logs — the system returns a paginated, filterable list of admin actions with timestamps, actor details, and metadata.

**Acceptance Scenarios**:

1. **Given** an authenticated admin user, **When** they request activity logs, **Then** the system returns a paginated list of log entries sorted by creation date (newest first)
2. **Given** the admin applies filters (action type, entity type, date range), **When** logs are retrieved, **Then** only matching entries are returned
3. **Given** an admin performs any dashboard view or report export, **When** the activity logs are checked, **Then** the action is recorded with the admin's identity, action type, timestamp, and relevant metadata

---

### Edge Cases

- What happens when analytics queries return no data for a given period? Zero values should be returned for counts, null for calculated metrics like averages.
- How does the system handle extremely large datasets (millions of records)? Aggregation services should use pre-computed snapshots and cached statistics to avoid heavy real-time queries.
- What happens when snapshot generation fails? The system should serve the most recent successful snapshot and log the error for admin review.
- How does the system handle concurrent admin users accessing the dashboard? The system should serve cached or snapshot data without executing duplicate aggregation queries.
- What happens when CSV/Excel export contains more records than a single request can handle? Exports should support streaming or chunked processing.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a dashboard overview endpoint returning all 13 widget metrics (total users, customers, providers, verified/active providers, total/active/completed/cancelled bookings, total revenue, pending payments, open tickets, active disputes)
- **FR-002**: System MUST provide user analytics endpoint with new user counts (today, week, month), customer/provider growth rates, and active/inactive user counts
- **FR-003**: System MUST provide provider analytics endpoint with top rated, most booked, and most active providers, verification status, completion rate, and cancellation rate
- **FR-004**: System MUST provide booking analytics endpoint with total, daily, weekly, monthly counts, status distribution, conversion rate, and average booking value
- **FR-005**: System MUST provide revenue analytics endpoint with total, daily, weekly, monthly revenue, revenue by category, revenue by provider, refund statistics, and failed payment statistics
- **FR-006**: System MUST provide review analytics endpoint with average platform rating, reviews per day/month, top rated categories, and rating distribution
- **FR-007**: System MUST provide support analytics endpoint with open/resolved ticket counts, average resolution time, active dispute count, and dispute resolution rate
- **FR-008**: System MUST provide geographic analytics endpoint with users, providers, bookings, and revenue grouped by city
- **FR-009**: All analytics endpoints MUST support date range filtering (Today, Last 7 Days, Last 30 Days, Last 90 Days, Custom Range)
- **FR-010**: System MUST generate scheduled analytics snapshots (daily, weekly, monthly) stored in a dedicated table
- **FR-011**: System MUST provide report generation endpoints for users, providers, bookings, revenue, and payments with pagination, sorting, and filtering
- **FR-012**: System MUST support exporting reports as CSV and Excel formats
- **FR-013**: System MUST log all admin dashboard accesses, report generations, and administrative actions to an immutable activity log
- **FR-014**: System MUST restrict all analytics and dashboard endpoints to authenticated admin users only
- **FR-015**: System MUST detect and surface operational alerts for high booking failure rates, payment failures, large refund volumes, suspicious user activity, provider suspensions, and increased support requests
- **FR-016**: System MUST use pre-computed aggregation and cached statistics rather than executing heavy queries on every dashboard request
- **FR-017**: System MUST paginate and sort all list endpoints (reports, activity logs)
- **FR-018**: System MUST support filtering reports by date range, provider, category, city, and status where applicable

### Key Entities

- **AnalyticsSnapshot**: Stores pre-computed aggregation results at scheduled intervals (daily, weekly, monthly). Contains snapshot type identifier, JSON data payload with all metric values, and generation timestamp. Independent aggregated records not directly related to other entities.
- **AdminActivityLog**: Immutable audit trail of all admin actions. Records admin identity, action type (dashboard access, report generation, status update, etc.), affected entity type and ID, contextual metadata, and creation timestamp. Each admin has many activity log entries.
- **Dashboard Metrics**: Transient data objects representing computed analytics results at a point in time. Not persisted as a single entity but aggregated from source entities (users, bookings, payments, reviews, tickets, disputes) on demand or via scheduled snapshots.

## API Contract & DTOs

- **DTO-001**: `DashboardOverviewDto` — Contains 13 numeric metric fields plus date range context. Response example: `{ totalUsers: 15234, totalCustomers: 12300, totalProviders: 2934, ... }`
- **DTO-002**: `UserAnalyticsDto` — Contains new user counts (today, week, month), growth rates (customer, provider), active/inactive counts. Supports date range filtering.
- **DTO-003**: `ProviderAnalyticsDto` — Contains top providers list, verification status counts, completion rate, cancellation rate.
- **DTO-004**: `BookingAnalyticsDto` — Contains total counts, time-series breakdowns, status distribution percentages, conversion rate, average value.
- **DTO-005**: `RevenueAnalyticsDto` — Contains total revenue, time-series breakdowns, category/provider breakdown, refund stats, failed payment stats.
- **DTO-006**: `ReviewAnalyticsDto` — Contains average rating, review counts (day, month), top categories, rating distribution histogram.
- **DTO-007**: `SupportAnalyticsDto` — Contains open/resolved ticket counts, average resolution time, active dispute count, dispute resolution rate.
- **DTO-008**: `GeographicAnalyticsDto` — Contains users/providers/bookings/revenue grouped by city with city name and count/value.
- **DTO-009**: `ReportFilterDto` — Supports filtering by date range, provider ID, category, city, status, with pagination (page, limit) and sorting (sortBy, sortOrder).
- **DTO-010**: `AdminActivityLogDto` — Contains log entry ID, admin ID, action type, entity type, entity ID, metadata, and timestamp.
- **DTO-011**: `OperationalAlertDto` — Contains alert type, severity, message, related entity reference, and timestamp.
- **DTO-012**: `DateRangeFilterDto` — Supports preset filters (today, last_7_days, last_30_days, last_90_days) and custom date range (startDate, endDate).
- **SWAG-001**: All dashboard endpoints decorated with `@ApiTags('Admin - Dashboard')`, `@ApiOperation` summaries, `@ApiResponse` (200, 401, 403), and `@ApiBearerAuth`.
- **SWAG-002**: All report endpoints decorated with `@ApiTags('Admin - Reports')`, query parameter documentation, and response type annotations.
- **SWAG-003**: Activity log endpoint decorated with full query parameter documentation for filter, sort, and pagination options.

### Measurable Outcomes

- **SC-001**: Administrators can view all 13 dashboard overview metrics within one API call that returns results in under 2 seconds.
- **SC-002**: All analytics endpoints return results within 3 seconds even when source data contains over 100,000 records.
- **SC-003**: Analytics snapshot generation for all metric types completes within 5 minutes for a platform with up to 500,000 users.
- **SC-004**: Administrators can export any report as CSV containing up to 10,000 rows within 10 seconds.
- **SC-005**: All admin actions, dashboard views, and report exports are recorded in the activity log with accurate actor identity, action type, and timestamp.
- **SC-006**: Scheduled snapshots (daily, weekly, monthly) generate automatically without manual intervention and are available within the expected time window.
- **SC-007**: Administrators can filter analytics and reports by date range with results scoped correctly to the selected period.
- **SC-008**: Operational alerts are detected and surfaced within 1 hour of the triggering condition being met.

## Assumptions

- The existing authentication and authorization system (JWT, role guards) will be reused for admin access control.
- The existing notification system will be used to deliver operational alerts to administrators.
- City-level data for geographic analytics will be extracted from existing user and booking address data; no additional address collection is needed.
- Scheduled analytics snapshots will use the existing background job infrastructure (Bull queues).
- CSV and Excel export functionality will be implemented using standard library support; no external reporting engine is required.
- Audit logging will follow the existing pattern (AuditLog entity with action, entityType, entityId, actorId, metadata).
- The feature depends on all existing platform modules being operational: Auth, Users, Providers, Services, Bookings, Reviews, Payments, Notifications, and Support/Disputes.
- Performance optimization via pre-computed snapshots and cached statistics is acceptable; real-time data is not required for historical analytics.
- Geographic analytics will prepare the data model for future map visualization by ensuring city names are stored with coordinates where available.
- Report generation and activity logs only support filtering, pagination, and sorting; complex aggregations for reports are out of scope.
