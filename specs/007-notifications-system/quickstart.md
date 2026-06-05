# Quickstart: Notifications System

## Running Tests

```bash
# Run all unit tests
npm test

# Run notifications-specific tests (if isolated)
npm test -- --testPathPattern=notifications

# Run e2e tests
npm run test:e2e
```

## Manual Testing Checklist

### User Story 1 — View & Manage Notifications

```bash
# 1. Authenticate as a customer
# 2. View notifications
curl -X GET "http://localhost:3000/api/v1/notifications?page=1&limit=20" \
  -H "Authorization: Bearer $TOKEN"

# 3. Check unread count
curl -X GET "http://localhost:3000/api/v1/notifications/unread-count" \
  -H "Authorization: Bearer $TOKEN"

# 4. Mark one as read
curl -X PATCH "http://localhost:3000/api/v1/notifications/$ID/read" \
  -H "Authorization: Bearer $TOKEN"

# 5. Mark all as read
curl -X PATCH "http://localhost:3000/api/v1/notifications/read-all" \
  -H "Authorization: Bearer $TOKEN"
```

### User Story 2 — Automatic Notification Generation

```bash
# Simulate a booking event (triggered internally by booking module)
# Verify notification appears in user's inbox
curl -X GET "http://localhost:3000/api/v1/notifications?type=Booking" \
  -H "Authorization: Bearer $TOKEN"
```

### User Story 3 — Admin Announcements

```bash
# 1. Authenticate as admin
# 2. Create announcement
curl -X POST "http://localhost:3000/api/v1/notifications/announcements" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Maintenance","message":"System will be down","targetAudience":"all"}'

# 3. List announcements
curl -X GET "http://localhost:3000/api/v1/notifications/announcements" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 4. Delete announcement
curl -X DELETE "http://localhost:3000/api/v1/notifications/announcements/$ID" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### User Story 4 — Filtering

```bash
# Filter by type
curl -X GET "http://localhost:3000/api/v1/notifications?type=Booking" \
  -H "Authorization: Bearer $TOKEN"

# Filter by read status
curl -X GET "http://localhost:3000/api/v1/notifications?isRead=false" \
  -H "Authorization: Bearer $TOKEN"

# Filter by date range
curl -X GET "http://localhost:3000/api/v1/notifications?startDate=2026-01-01&endDate=2026-06-01" \
  -H "Authorization: Bearer $TOKEN"

# Combined filters
curl -X GET "http://localhost:3000/api/v1/notifications?type=Booking&isRead=false" \
  -H "Authorization: Bearer $TOKEN"
```

## Authentication & Authorization

- **JWT Bearer Token**: Required for all endpoints
- **Customer**: Own notifications only
- **Provider**: Own notifications only
- **Admin**: Own notifications + announcement management

## Expected Status Codes

| Scenario | Status |
|----------|--------|
| Success | 200 |
| Created (announcement) | 201 |
| Unauthorized (no token) | 401 |
| Forbidden (wrong role) | 403 |
| Not Found | 404 |
| Validation Error | 422 |
