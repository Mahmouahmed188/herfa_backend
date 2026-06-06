# Quickstart: Admin Dashboard & Analytics System

**Phase**: 1 | **Date**: 2026-06-06

## Prerequisites

- NestJS project with TypeORM configured
- Existing entities: `User`, `CustomerProfile`, `ProviderProfile`, `Booking`, `Payment`, `Review`, `SupportTicket`, `Dispute`, `AuditLog`
- Existing modules: Auth, Users, Providers, Bookings, Reviews, Payments, Notifications, Support
- Existing background job infrastructure: `BullModule` configured with Redis
- Existing guards: `JwtAuthGuard`, `RolesGuard`

## Implementation Order

### Step 1: Create Entities

Create 2 new entity files in `src/entities/`:

1. `analytics-snapshot.entity.ts` — AnalyticsSnapshot entity
2. `admin-activity-log.entity.ts` — AdminActivityLog entity

Follow existing entity conventions:
- `@Entity('snake_case_table_name')`
- `@PrimaryGeneratedColumn('uuid')`
- `@CreateDateColumn()` for timestamps
- `@Column({ type: 'json' })` for JSONB data
- `@ManyToOne` for relationships
- Table-level `@Index()` decorators

### Step 2: Create Enum

Add new action types enum for admin activity logging in `src/modules/analytics/enums/`:
- `admin-action.enum.ts` — dashboard_view, report_export, status_update, settings_change, user_action

### Step 3: Generate Migration

Run TypeORM migration generation to create `analytics_snapshots` and `admin_activity_logs` tables with all indexes.

### Step 4: Create DTOs

Create DTO files in `src/modules/analytics/dto/` with class-validator decorators and Swagger decorators:

- `dashboard-overview.dto.ts`
- `user-analytics.dto.ts`
- `provider-analytics.dto.ts`
- `booking-analytics.dto.ts`
- `revenue-analytics.dto.ts`
- `review-analytics.dto.ts`
- `support-analytics.dto.ts`
- `geographic-analytics.dto.ts`
- `date-range-filter.dto.ts`
- `report-filter.dto.ts`
- `activity-log.dto.ts`
- `operational-alert.dto.ts`

### Step 5: Create Module

Create `analytics.module.ts` registering all entities, services, controllers, importing required modules (TypeOrm, Bull, Auth), and registering Bull queues for snapshot generation and alert detection.

### Step 6: Create Services (in order of dependency)

Create services in `src/modules/analytics/services/`:

1. **activity-log.service.ts** — Log admin actions (no dependencies on other analytics services)
2. **user-analytics.service.ts** — User growth, engagement queries via TypeORM QueryBuilder
3. **provider-analytics.service.ts** — Provider performance queries
4. **booking-analytics.service.ts** — Booking metrics, status distribution, conversion rate
5. **revenue-analytics.service.ts** — Revenue aggregation, refund/failure statistics
6. **review-analytics.service.ts** — Review metrics, rating distribution
7. **support-analytics.service.ts** — Support ticket and dispute metrics
8. **geographic-analytics.service.ts** — City-level aggregation
9. **alert.service.ts** — Operational alert detection
10. **analytics-snapshot.service.ts** — Orchestrates all analytics services, stores snapshots
11. **report.service.ts** — Report generation, CSV/Excel export
12. **dashboard.service.ts** — Aggregates all analytics for overview endpoint

### Step 7: Create Controllers

- `analytics.controller.ts` — Dashboard endpoints (overview, users, providers, bookings, revenue, reviews, support, geographic)
- `reports.controller.ts` — Report generation and export endpoints
- `activity-logs.controller.ts` — Activity log listing endpoint

### Step 8: Create Guards

Reuse existing `JwtAuthGuard` and `RolesGuard` with `@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)` — no new guards needed.

### Step 9: Create Bull Queue Processors

Create job processors in `src/modules/analytics/jobs/`:

1. `analytics-snapshot.job.ts` — Repeatable Bull processor for daily, weekly, monthly snapshots
2. `alert-detection.job.ts` — Periodic Bull processor for operational alert checks

### Step 10: Add Swagger Decorators

Add `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`, `@ApiQuery` to all endpoints.

### Step 11: Create Tests

- Unit tests for all services
- Unit tests for controllers
- Unit tests for job processors

### Step 12: Wire in App Module

Add `AnalyticsModule` to `app.module.ts` imports.

## Key Integration Points

| Integration | Details |
|-------------|---------|
| Auth Module | JWT guard for all endpoints; admin role validation |
| Users Module | User count, growth rate, active/inactive queries |
| Providers Module | Provider performance, verification status, completion rate |
| Bookings Module | Booking counts, status distribution, conversion rate, average value |
| Payments Module | Revenue aggregation, refund stats, payment failure stats |
| Reviews Module | Average rating, review counts, rating distribution |
| Notifications Module | Alert delivery via existing notification infrastructure |
| Support Module | Ticket counts, average resolution time, dispute stats |
| Bull/Redis | Scheduled snapshot generation and alert detection jobs |

## Migration Command

```bash
npm run migration:generate -- src/migrations/CreateAnalyticsTables
```

Expected tables:
- `analytics_snapshots`
- `admin_activity_logs`
