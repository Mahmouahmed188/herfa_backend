# Data Model: Reviews & Ratings System

## Entity: Review

**Table**: `reviews` (extends existing entity)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK | `@PrimaryGeneratedColumn('uuid')` |
| bookingId | uuid | FK → bookings, NOT NULL, INDEX | New — primary association per spec |
| booking | relation | ManyToOne → Booking | `@JoinColumn({ name: 'booking_id' })` |
| customerId | uuid | FK → users, NOT NULL, INDEX | Renamed from `reviewerId` for clarity |
| customer | relation | ManyToOne → User | Reviewer (customer who received service) |
| providerId | uuid | FK → provider_profiles, NOT NULL, INDEX | Renamed from `revieweeId` |
| provider | relation | ManyToOne → ProviderProfile | Reviewee (provider who delivered service) |
| rating | integer | 1-5, NOT NULL | Star rating |
| comment | text | nullable, max 1000 chars | Optional review text |
| isVisible | boolean | default true | Soft-hide for admin moderation |
| editableUntil | timestamp | nullable | `createdAt + 24h` — edit/delete deadline |
| removedByAdmin | boolean | default false | Flag for admin-removed reviews |
| adminRemovalReason | text | nullable | Admin's reason for removal |
| removedAt | timestamp | nullable | When admin removed it |
| createdAt | timestamp | auto | `@CreateDateColumn()` |
| updatedAt | timestamp | auto | `@UpdateDateColumn()` |

**Existing fields kept**: `jobId` (nullable), `job` (nullable relation), `type` (ReviewType), `images` (nullable) — for backward compatibility.

**Indexes**:
- `@Index(['bookingId'])` — unique constraint lookup
- `@Index(['providerId', 'isVisible', 'createdAt'])` — public/provider review listing
- `@Index(['customerId'])` — my reviews lookup
- `@Unique(['bookingId'])` — database-level duplicate prevention (FR-003)

**Validation rules**:
- `rating`: 1-5 integer (FR-004)
- `comment`: optional, max 1000 chars (FR-005)
- One review per booking (FR-003, unique constraint)
- Booking must have status `completed` (FR-001, service-level check)
- Customer must own the booking (FR-002, service-level check)

**State transitions**:
- Created: initial state after valid submission
- Edited: within 24h window (FR-015) — rating and/or comment updated
- Deleted by customer: within 24h window (FR-016) — hard delete
- Removed by admin: any time (FR-013) — flagged, not deleted
- Visible → Hidden: admin toggles isVisible

---

## Entity: ProviderRatingStats

**Table**: `provider_rating_stats`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK | `@PrimaryGeneratedColumn('uuid')` |
| providerId | uuid | FK → provider_profiles, UNIQUE, NOT NULL | One-to-one with provider |
| provider | relation | OneToOne → ProviderProfile | `@JoinColumn({ name: 'provider_id' })` |
| averageRating | decimal | precision 3, scale 2, default 0 | Calculated average |
| totalReviews | integer | default 0 | Total visible reviews count |
| fiveStarCount | integer | default 0 | Rating = 5 |
| fourStarCount | integer | default 0 | Rating = 4 |
| threeStarCount | integer | default 0 | Rating = 3 |
| twoStarCount | integer | default 0 | Rating = 2 |
| oneStarCount | integer | default 0 | Rating = 1 |
| updatedAt | timestamp | auto | `@UpdateDateColumn()` |

**Indexes**:
- `@Index(['providerId'], { unique: true })` — fast lookup
- `@Index(['averageRating'])` — sort providers by rating

**Atomic update logic** (FR-006):
```sql
-- Recalculate from visible reviews
SELECT
  AVG(rating) as avg,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE rating = 5) as five,
  COUNT(*) FILTER (WHERE rating = 4) as four,
  COUNT(*) FILTER (WHERE rating = 3) as three,
  COUNT(*) FILTER (WHERE rating = 2) as two,
  COUNT(*) FILTER (WHERE rating = 1) as one
FROM reviews
WHERE providerId = :providerId AND isVisible = true
```
Result upserted into `provider_rating_stats`. Also updates `ProviderProfile.rating = averageRating` for backward compat (FR-022).

---

## Entity: ModerationLog

**Table**: `moderation_logs`

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK | `@PrimaryGeneratedColumn('uuid')` |
| reviewId | uuid | FK → reviews, NOT NULL, INDEX | Which review was acted on |
| review | relation | ManyToOne → Review | |
| adminId | uuid | FK → users, NOT NULL | Who performed the action |
| admin | relation | ManyToOne → User | |
| action | varchar(50) | NOT NULL | e.g., 'removed', 'restored' |
| reason | text | nullable | Why the action was taken |
| createdAt | timestamp | auto | `@CreateDateColumn()` |

**Indexes**:
- `@Index(['reviewId'])` — lookup by review
- `@Index(['adminId'])` — lookup by admin
- `@Index(['createdAt'])` — chronological queries

---

## Entity Relationship Diagram

```
User (customer)
  │
  │ 1
  │ │
  │ ├──< Booking
  │       │ 1
  │       │ │
  │       └──< Review (bookingId)
  │             │
  │             │ 1
  │             ├──< ModerationLog (reviewId)
  │             │
  │             │ *
  │             └──> ProviderProfile (providerId)
  │                      │
  │                      │ 1
  │                      └── ProviderRatingStats (providerId)
  │
  User (admin)
  │
  └──< ModerationLog (adminId)
```

**Key relationships**:
- Review → Booking: Many-to-One (one review per booking via unique constraint)
- Review → User (customer): Many-to-One
- Review → ProviderProfile: Many-to-One
- ProviderRatingStats → ProviderProfile: One-to-One
- ModerationLog → Review: Many-to-One
- ModerationLog → User (admin): Many-to-One
