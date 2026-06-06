# Research: Admin Dashboard & Analytics System

**Phase**: 0 | **Date**: 2026-06-06

## Overview

No [NEEDS CLARIFICATION] markers exist in the spec. This research confirms existing codebase patterns, identifies aggregation approaches, and determines best practices for analytics, reporting, and scheduled job implementation.

## 1. Existing Admin Dashboard Pattern

- **Location**: `src/modules/admin/admin.service.ts`
- **Current implementation**: `getDashboardStats()` uses `this.userRepository.count()`, `this.jobRepository.count()`, and raw query builder `SELECT SUM(payment.amount)` for total revenue
- **Limitations**: Only provides basic counts, no time-series analytics, no date filtering, no provider/review/support metrics
- **Decision**: Create a dedicated `analytics` module rather than extending the existing admin module. The new module will provide all dashboard, analytics, reporting, and activity logging functionality while the existing admin module continues to handle user/application management.

## 2. Aggregation & Query Patterns

- **Existing pattern**: TypeORM `QueryBuilder` with `select()`, `addSelect()`, `where()`, `groupBy()`, `getRawMany()` / `getRawOne()`
- **Example from admin service**: 
  ```typescript
  const revenueResult = await this.paymentRepository
    .createQueryBuilder('payment')
    .select('SUM(payment.amount)', 'total')
    .where('payment.paymentStatus = :status', { status: 'paid' })
    .getRawOne();
  ```
- **Date range filtering**: `Between(new Date(from), new Date(to))` from TypeORM
- **Decision**: Use `QueryBuilder` for all aggregation queries with `Between` for date filtering. Create dedicated aggregation services for each analytics domain (users, providers, bookings, revenue, reviews, support, geographic).

## 3. Background Job Infrastructure

- **Setup**: `BullModule.forRootAsync()` in `app.module.ts` with Redis connection
- **Existing usage**: Several modules use Bull queues (notifications, bookings, etc.)
- **Queue pattern**: `@InjectQueue('queue-name')` in producer services, `@Processor('queue-name')` in consumer classes
- **Decision**: Create a `analytics-snapshot` Bull queue with scheduled repeatable jobs for daily, weekly, and monthly snapshot generation. Create an `alert-detection` queue for periodic operational alert checks.

## 4. Report Export Libraries

- **Current state**: No existing CSV/Excel export utility in the codebase
- **CSV generation**: Node.js built-in `fs` module with manual CSV formatting, or `json2csv` library
- **Excel generation**: `exceljs` library recommended for structured Excel files with formatting, multiple sheets, and streaming support
- **Decision**: Use `exceljs` for Excel exports (already commonly used in NestJS ecosystems) and manual CSV streaming for CSV exports. Both can be implemented as injectable services.

## 5. Geographic Data Sources

- **User entity**: No direct city field on User. `CustomerProfile` has `defaultAddress` (free text) and lat/lng. `ProviderProfile` has `address` (free text) and lat/lng.
- **Booking entity**: Has `city` field (varchar 100), `addressLine`, `latitude`, `longitude`
- **Decision**: Extract city-level data primarily from `Booking.city` for booking and revenue geographic analytics. For user/provider counts by city, parse address fields where available. Store pre-computed city aggregations in weekly/monthly snapshots. Add city coordinates to support future map visualizations.

## 6. Operational Alert Detection

- **Current state**: No existing alert detection system
- **Approach**: Configurable threshold-based detection that runs on a schedule (e.g., every 15-30 minutes)
- **Alert types**: High booking failure rate (>X%), payment failures (>Y count), large refund volume (>Z amount), suspicious user activity (rapid registration), provider suspensions, increased support requests (>baseline + threshold)
- **Delivery**: Use existing `NotificationsService` to create notifications for admin users
- **Decision**: Implement a periodic Bull job that checks configured thresholds against current metrics and creates notifications when thresholds are exceeded. Thresholds defined as module configuration.

## 7. Snapshot Strategy

- **Snapshot types**: daily, weekly, monthly
- **Data stored**: All computed metric values serialized as JSON in `analytics_snapshots` table
- **Serving pattern**: Dashboard/analytics endpoints check for most recent snapshot first; if fresh enough (within expected interval), serve from snapshot. If stale or missing, compute in real-time and optionally trigger async snapshot update.
- **Decision**: Create `AnalyticsSnapshotService` that computes all metric types and stores them. Snapshot jobs use this service. Dashboard endpoints have a fallback: snapshot first, real-time computation if snapshot is stale.

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Module location | Dedicated `analytics` module | Separation from existing admin module; follows module-based structure |
| Aggregation method | TypeORM QueryBuilder | Existing pattern throughout codebase |
| Background jobs | Bull queues with repeatable jobs | Already configured and used across modules |
| Excel export | `exceljs` library | Popular, well-maintained, supports streaming |
| CSV export | Manual streaming via Node.js fs | No external dependency needed; simple format |
| Snapshot serving | Snapshot-first with real-time fallback | Balances performance and data freshness |
| Alert detection | Threshold-based periodic checks | Simple, configurable, extensible |
| Geographic cities | Primarily from Booking.city | Most reliable city data source |
