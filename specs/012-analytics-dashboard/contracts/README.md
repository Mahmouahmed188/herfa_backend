# API Contracts: Admin Dashboard & Analytics System

**Phase**: 1 | **Date**: 2026-06-06

## Common Headers

All endpoints require: `Authorization: Bearer <JWT token>` with admin role.

## Dashboard Endpoints

### GET /admin/dashboard/overview

Returns high-level platform metrics across all widget categories.

**Auth**: Admin (JWT required)

**Query Params**: dateRange (today | last_7_days | last_30_days | last_90_days), startDate, endDate

**Response** (200):
```json
{
  "success": true,
  "data": {
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
    "activeDisputes": 12,
    "period": { "startDate": "2026-06-01", "endDate": "2026-06-06" }
  }
}
```

### GET /admin/dashboard/users

Returns user growth and engagement analytics.

**Auth**: Admin (JWT required)

**Query Params**: dateRange, startDate, endDate

**Response** (200):
```json
{
  "success": true,
  "data": {
    "newUsersToday": 45,
    "newUsersThisWeek": 312,
    "newUsersThisMonth": 1345,
    "customerGrowthRate": 2.5,
    "providerGrowthRate": 1.8,
    "activeUsers": 8900,
    "inactiveUsers": 6334
  }
}
```

### GET /admin/dashboard/providers

Returns provider performance analytics.

**Auth**: Admin (JWT required)

**Query Params**: dateRange, startDate, endDate

**Response** (200):
```json
{
  "success": true,
  "data": {
    "topRatedProviders": [
      { "providerId": "uuid", "businessName": "ABC Services", "rating": 4.9, "totalJobs": 345 }
    ],
    "mostBookedProviders": [...],
    "mostActiveProviders": [...],
    "verificationCounts": { "pending": 300, "verified": 2100, "rejected": 534 },
    "completionRate": 85.3,
    "cancellationRate": 12.1
  }
}
```

### GET /admin/dashboard/bookings

Returns booking performance analytics.

**Auth**: Admin (JWT required)

**Query Params**: dateRange, startDate, endDate

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalBookings": 45678,
    "dailyBookings": [ { "date": "2026-06-01", "count": 245 } ],
    "weeklyBookings": [ { "week": "2026-W23", "count": 1789 } ],
    "monthlyBookings": [ { "month": "2026-06", "count": 7890 } ],
    "statusDistribution": { "pending": 5.2, "accepted": 3.1, "in_progress": 8.3, "completed": 71.4, "cancelled": 12.0 },
    "conversionRate": 78.5,
    "averageBookingValue": 125.50
  }
}
```

### GET /admin/dashboard/revenue

Returns financial performance analytics.

**Auth**: Admin (JWT required)

**Query Params**: dateRange, startDate, endDate

**Response** (200):
```json
{
  "success": true,
  "data": {
    "totalRevenue": 1234567.89,
    "dailyRevenue": [ { "date": "2026-06-01", "amount": 45678.90 } ],
    "weeklyRevenue": [ { "week": "2026-W23", "amount": 312456.78 } ],
    "monthlyRevenue": [ { "month": "2026-06", "amount": 1234567.89 } ],
    "revenueByCategory": [ { "category": "Cleaning", "amount": 456789.12 } ],
    "revenueByProvider": [ { "providerId": "uuid", "businessName": "ABC Services", "amount": 123456.78 } ],
    "totalRefunds": 23456.78,
    "refundCount": 89,
    "failedPaymentCount": 123,
    "failedPaymentVolume": 45678.90
  }
}
```

### GET /admin/dashboard/reviews

Returns customer satisfaction analytics.

**Auth**: Admin (JWT required)

**Query Params**: dateRange, startDate, endDate

**Response** (200):
```json
{
  "success": true,
  "data": {
    "averageRating": 4.3,
    "reviewsPerDay": 12,
    "reviewsPerMonth": 360,
    "topRatedCategories": [ { "category": "Cleaning", "averageRating": 4.6 } ],
    "ratingDistribution": { "1": 45, "2": 67, "3": 234, "4": 890, "5": 2345 }
  }
}
```

### GET /admin/dashboard/support

Returns customer support performance analytics.

**Auth**: Admin (JWT required)

**Query Params**: dateRange, startDate, endDate

**Response** (200):
```json
{
  "success": true,
  "data": {
    "openTickets": 45,
    "resolvedTickets": 892,
    "averageResolutionHours": 24.5,
    "activeDisputes": 12,
    "disputeResolutionRate": 78.0
  }
}
```

---

## Report Endpoints

### GET /admin/reports/users

Paginated, filterable user report.

**Auth**: Admin (JWT required)

**Query Params**: page, limit, sortBy, sortOrder, dateFrom, dateTo, status, role, search

**Response** (200):
```json
{
  "success": true,
  "data": [...users],
  "meta": { "page": 1, "limit": 20, "total": 15234, "totalPages": 762 }
}
```

### GET /admin/reports/providers

Paginated, filterable provider report.

**Auth**: Admin (JWT required)

**Query Params**: page, limit, sortBy, sortOrder, dateFrom, dateTo, status, verificationStatus, city, search

**Response** (200): Paginated provider list.

### GET /admin/reports/bookings

Paginated, filterable booking report.

**Auth**: Admin (JWT required)

**Query Params**: page, limit, sortBy, sortOrder, dateFrom, dateTo, status, providerId, category, city

**Response** (200): Paginated booking list.

### GET /admin/reports/revenue

Paginated, filterable payment/revenue report.

**Auth**: Admin (JWT required)

**Query Params**: page, limit, sortBy, sortOrder, dateFrom, dateTo, paymentStatus, providerId, category

**Response** (200): Paginated payment list.

### GET /admin/reports/payments

Paginated, filterable payment report with export support.

**Auth**: Admin (JWT required)

**Query Params**: page, limit, sortBy, sortOrder, dateFrom, dateTo, paymentStatus, paymentMethod

**Response** (200): Paginated payment list.

### GET /admin/reports/:type/export

Export report as CSV or Excel.

**Auth**: Admin (JWT required)

**Path Params**: type (users | providers | bookings | revenue | payments)

**Query Params**: format (csv | xlsx), dateFrom, dateTo, status, filters...

**Response** (200): File download with appropriate Content-Type and Content-Disposition headers.

---

## Activity Logs Endpoint

### GET /admin/activity-logs

Paginated, filterable list of admin activity log entries.

**Auth**: Admin (JWT required)

**Query Params**: page, limit, sortBy, sortOrder, dateFrom, dateTo, adminId, action, entityType

**Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "adminId": "uuid",
      "action": "dashboard_view",
      "entityType": "Dashboard",
      "entityId": null,
      "metadata": { "section": "overview", "dateRange": "last_7_days" },
      "createdAt": "2026-06-06T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 456, "totalPages": 23 }
}
```

---

## Error Responses

All endpoints return structured errors:
```json
{
  "success": false,
  "message": "Unauthorized",
  "errorCode": "UNAUTHORIZED"
}
```

Common error codes: `UNAUTHORIZED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `REPORT_GENERATION_FAILED`, `SNAPSHOT_NOT_FOUND`.
