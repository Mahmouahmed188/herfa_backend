# Quickstart: Reviews & Ratings System

## Prerequisites

- NestJS dev server running (`npm run start:dev`)
- PostgreSQL (or SQLite for development)
- Existing modules: Bookings (for booking validation), Providers (for provider profile/rating)

## What's Already in Place

- `src/entities/review.entity.ts` — Review entity with basic fields
- `src/modules/reviews/` — Module, controller, service skeleton
- `src/modules/reviews/reviews.module.ts` — Imported in `AppModule`

## What Needs to Be Built

### Entities (2 new, 1 extended)

| Entity | Action | File |
|--------|--------|------|
| Review | Extend — add bookingId, editableUntil, moderation fields | `src/entities/review.entity.ts` |
| ProviderRatingStats | Create | `src/entities/provider-rating-stats.entity.ts` |
| ModerationLog | Create | `src/entities/moderation-log.entity.ts` |

### Module Structure (build out)

```
src/modules/reviews/
├── reviews.module.ts                    # Import new entities
├── reviews.controller.ts               # Rewrite with role-based endpoints
├── reviews.service.ts                  # Full business logic
├── dto/
│   ├── create-review.dto.ts
│   ├── update-review.dto.ts
│   ├── review-response.dto.ts
│   ├── review-filter.dto.ts
│   ├── provider-rating-stats-response.dto.ts
│   └── moderation-log-response.dto.ts
├── guards/
│   └── review-ownership.guard.ts
└── events/
    └── review.events.ts
```

### Implementation Order

1. **Entities**: Create `ProviderRatingStats`, `ModerationLog`. Extend `Review`.
2. **DTOs**: Create all 6 DTO files with validation and Swagger decorators.
3. **Module**: Update `ReviewsModule` imports (add new entity repos, export service).
4. **Service**: Rewrite `ReviewsService` — full CRUD, stats update, event emission, time-window logic.
5. **Controllers**: Split into customer, provider, admin controllers.
6. **Guards**: Create `ReviewOwnershipGuard` for customer edit/delete authorization.
7. **Update Provider Profile**: Ensure `ProviderProfile.rating` is synced with `ProviderRatingStats.averageRating`.
8. **Register entities** in `TypeOrmModule` (entities auto-discovered via glob pattern).

### Key Business Rules

- Only completed bookings → review allowed (FR-001)
- One review per booking — DB unique constraint + service check (FR-003)
- Edit/delete window: 24h from creation (FR-015, FR-016)
- Admin removal: hard-remove visibility, log to ModerationLog (FR-013, FR-014)
- Stats recalculation: on every create, edit, delete, admin remove (FR-006)

### Verification

- Run existing unit tests: `npx jest --testPathPattern="reviews"`
- Test endpoints manually via Swagger at `/api/docs`
- Verify provider stats update after review operations
