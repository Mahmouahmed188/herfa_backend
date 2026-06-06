# Data Model: Admin Dashboard & Analytics System

**Phase**: 1 | **Date**: 2026-06-06

## Entity: AnalyticsSnapshot

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default: uuid_generate_v4() | |
| snapshotType | varchar(20) | NOT NULL | daily, weekly, monthly |
| data | jsonb | NOT NULL | All computed metric values |
| generatedAt | timestamp | NOT NULL, DEFAULT now() | |

**Relationships**: None (independent aggregated records)

**Indexes**:
- `idx_analytics_snapshots_type` ON (snapshotType)
- `idx_analytics_snapshots_generatedAt` ON (generatedAt)
- `idx_analytics_snapshots_type_generatedAt` ON (snapshotType, generatedAt) — for efficient "latest by type" queries

**Data Structure (JSON)**:
```json
{
  "dashboard": {
    "totalUsers": 15234,
    "totalCustomers": 12300,
    "totalProviders": 2934,
    "verifiedProviders": 2100,
    "activeProviders": 1800,
    "totalBookings": 45678,
    "activeBookings": 1234,
    "completedBookings": 38900,
    "cancelledBookings": 5544,
    "totalRevenue": 1234567.89,
    "pendingPayments": 234,
    "openSupportTickets": 45,
    "activeDisputes": 12
  },
  "userAnalytics": {
    "newUsersToday": 45,
    "newUsersThisWeek": 312,
    "newUsersThisMonth": 1345,
    "customerGrowthRate": 2.5,
    "providerGrowthRate": 1.8,
    "activeUsers": 8900,
    "inactiveUsers": 6334
  },
  "providerAnalytics": {
    "topRatedProviders": [...],
    "mostBookedProviders": [...],
    "mostActiveProviders": [...],
    "verificationCounts": { "pending": 300, "verified": 2100, "rejected": 534 },
    "completionRate": 85.3,
    "cancellationRate": 12.1
  },
  "bookingAnalytics": {
    "totalBookings": 45678,
    "dailyBookings": [...],
    "weeklyBookings": [...],
    "monthlyBookings": [...],
    "statusDistribution": { "pending": 5, "accepted": 3, "in_progress": 8, "completed": 85, "cancelled": 12 },
    "conversionRate": 78.5,
    "averageBookingValue": 125.50
  },
  "revenueAnalytics": {
    "totalRevenue": 1234567.89,
    "dailyRevenue": [...],
    "weeklyRevenue": [...],
    "monthlyRevenue": [...],
    "revenueByCategory": [...],
    "revenueByProvider": [...],
    "totalRefunds": 23456.78,
    "failedPaymentCount": 123,
    "failedPaymentVolume": 45678.90
  },
  "reviewAnalytics": {
    "averageRating": 4.3,
    "reviewsPerDay": 12,
    "reviewsPerMonth": 360,
    "topRatedCategories": [...],
    "ratingDistribution": { "1": 45, "2": 67, "3": 234, "4": 890, "5": 2345 }
  },
  "supportAnalytics": {
    "openTickets": 45,
    "resolvedTickets": 892,
    "averageResolutionHours": 24.5,
    "activeDisputes": 12,
    "disputeResolutionRate": 78.0
  },
  "geographicAnalytics": {
    "usersByCity": [...],
    "providersByCity": [...],
    "bookingsByCity": [...],
    "revenueByCity": [...]
  },
  "period": {
    "startDate": "2026-06-01",
    "endDate": "2026-06-06"
  }
}
```

---

## Entity: AdminActivityLog

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default: uuid_generate_v4() | |
| adminId | uuid | NOT NULL, FK → users.id | Admin who performed the action |
| action | varchar(50) | NOT NULL | e.g., dashboard_view, report_export, status_update |
| entityType | varchar(30) | NULL | e.g., User, Booking, Report |
| entityId | uuid | NULL | ID of affected entity |
| metadata | jsonb | NULL | Action-specific contextual data |
| createdAt | timestamp | NOT NULL, DEFAULT now() | Immutable — never updated |

**Relationships**:
- `@ManyToOne` → User (adminId)

**Indexes**:
- `idx_admin_activity_logs_adminId` ON (adminId)
- `idx_admin_activity_logs_action` ON (action)
- `idx_admin_activity_logs_entityType` ON (entityType)
- `idx_admin_activity_logs_createdAt` ON (createdAt)
- `idx_admin_activity_logs_adminId_createdAt` ON (adminId, createdAt)

**Immutability**: Once created, records are never updated or deleted. This is an append-only log.

---

## Entity Relationship Diagram

```
User (1) ──< AdminActivityLog (N)
AnalyticsSnapshot (independent — no FK relationships)
```

## Constraints

1. AnalyticsSnapshot records are immutable after creation (append-only log of computed snapshots).
2. AdminActivityLog records are immutable after creation (append-only audit trail).
3. Snapshot data is stored as JSONB — all assertions and validations must happen before storage.
4. The most recent snapshot of each type (daily, weekly, monthly) can be retrieved efficiently using the composite index on (snapshotType, generatedAt).
