# Feature Specification: Reviews & Ratings System

**Feature Branch**: `005-reviews-ratings-system`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "Reviews & Ratings System for the Herfa Backend - customers rate and review providers after successful service completion"

## User Scenarios & Testing

### User Story 1 - Customer submits a review after completed service (Priority: P1)

A customer who received a service wants to rate their provider. After their booking is marked completed, they write a review with a star rating and optional comment. The provider's average rating updates automatically after submission.

**Why this priority**: Core value proposition — reviews are the primary feature; without this story nothing else matters.

**Independent Test**: Can be fully tested by completing a booking, submitting a valid review, and verifying the review is stored and the provider's stats reflect the new rating.

**Acceptance Scenarios**:

1. **Given** a completed booking belonging to the customer, **When** the customer submits a review with rating 4 and a comment, **Then** the review is saved and the provider's average rating updates
2. **Given** a completed booking belonging to the customer, **When** the customer submits a review with rating 5 without a comment, **Then** the review is saved successfully
3. **Given** a pending booking belonging to the customer, **When** the customer attempts to submit a review, **Then** the system rejects the request with an eligibility error
4. **Given** a booking belonging to another customer, **When** the customer attempts to submit a review, **Then** the system rejects the request
5. **Given** a completed booking that already has a review, **When** the customer attempts to submit another review, **Then** the system rejects with a duplicate review error

---

### User Story 2 - Provider views their ratings and reviews (Priority: P2)

A provider wants to see feedback from customers. They open their dashboard to view all reviews they've received along with their average rating, total review count, and rating distribution (how many 5-star, 4-star, etc.).

**Why this priority**: Providers need visibility into their reputation to improve service quality.

**Independent Test**: Can be tested independently after reviews exist — the provider opens the ratings view and sees stats matching the submitted reviews.

**Acceptance Scenarios**:

1. **Given** reviews exist for the provider, **When** the provider views their reviews page, **Then** they see all received reviews with rating, comment, and date
2. **Given** reviews exist for the provider, **When** the provider views their rating statistics, **Then** they see average rating, total count, and breakdown by star level
3. **Given** the provider has no reviews, **When** they view their rating statistics, **Then** they see zero values (not an error)

---

### User Story 3 - Public views a provider's reviews and rating (Priority: P2)

A potential customer browsing providers wants to see what others have said. They open a provider profile and see the average rating, total reviews, and a paginated list of individual reviews.

**Why this priority**: Public visibility of reviews drives trust and is essential for the marketplace.

**Independent Test**: Can be tested by navigating to a provider's public reviews endpoint with no authentication and verifying the rating stats and review list are returned.

**Acceptance Scenarios**:

1. **Given** a provider with reviews, **When** an unauthenticated user views the provider's reviews, **Then** they see a paginated list of reviews sorted by date
2. **Given** a provider with reviews, **When** an unauthenticated user views the provider's rating, **Then** they see average rating and star distribution
3. **Given** a provider with no reviews, **When** an unauthenticated user views the provider's rating, **Then** they see zero values

---

### User Story 4 - Admin moderates reviews (Priority: P3)

An admin notices an abusive review and removes it. The removal is logged for audit purposes. The provider's rating stats are recalculated to reflect the removal.

**Why this priority**: Moderation is essential for trust but is a fallback action that only applies to a small fraction of reviews.

**Independent Test**: Can be tested by having an admin delete a review and verifying it is removed from public view, the action is logged, and provider stats are recalculated.

**Acceptance Scenarios**:

1. **Given** an abusive review exists, **When** an admin removes it, **Then** the review is no longer visible to any user
2. **Given** an admin removes a review, **When** the action is verified, **Then** the moderation action is logged with admin ID, timestamp, and reason
3. **Given** an admin removes a review, **When** the provider stats are checked, **Then** the stats are updated to exclude the removed review

---

### User Story 5 - Customer edits their review (Priority: P3)

A customer wants to update their review — maybe they received follow-up service or want to correct a mistake. They edit the rating and/or comment within the allowed time window.

**Why this priority**: Editing improves review accuracy but can be deferred to a later iteration.

**Independent Test**: Can be tested by submitting a review, waiting a short time, editing it, and verifying the updated content is saved.

**Acceptance Scenarios**:

1. **Given** a review submitted within the editable window, **When** the customer updates the rating from 4 to 5, **Then** the review shows the updated rating
2. **Given** a review submitted within the editable window, **When** the customer updates the comment, **Then** the review shows the updated comment
3. **Given** a review outside the editable window, **When** the customer attempts to edit, **Then** the system rejects the request

---

### User Story 6 - Customer deletes their review (Priority: P3)

A customer decides to remove their review (e.g., they resolved an issue directly with the provider). They delete it within the allowed window, and the provider stats are recalculated.

**Why this priority**: Deletion is useful for dispute resolution but is used infrequently.

**Independent Test**: Can be tested by submitting and then deleting a review within the allowed window, verifying it is removed and stats are updated.

**Acceptance Scenarios**:

1. **Given** a review submitted within the deletable window, **When** the customer deletes it, **Then** the review is removed and provider stats are recalculated
2. **Given** a review outside the deletable window, **When** the customer attempts to delete, **Then** the system rejects the request

---

### Edge Cases

- What happens when a booking is completed and later cancelled by admin? (Review should remain valid — it was submitted when the booking was validly completed)
- How does the system handle concurrent review submissions for the same booking? (Database-level unique constraint on bookingId prevents duplicates)
- What happens to provider stats if the only review is deleted? (Stats reset to zero — total 0, avg 0, all counts 0)
- How are reviews handled if the provider or customer account is deleted? (Reviews remain visible but show "deleted user" — consistent with existing platform patterns)
- What happens if rating calculation fails mid-operation? (Stats update and review save should be atomic — either both succeed or both roll back)

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow customers to create a review only for bookings with status "completed"
- **FR-002**: System MUST verify that a booking belongs to the authenticated customer before allowing review creation
- **FR-003**: System MUST enforce one review per booking (no duplicate reviews)
- **FR-004**: Customers MUST be able to rate providers on a 1-5 star scale
- **FR-005**: Customers MUST be able to provide an optional comment (max 1000 characters)
- **FR-006**: System MUST automatically recalculate provider rating stats after every review create, edit, or delete
- **FR-007**: System MUST provide provider rating statistics: average rating, total reviews, and distribution count per star level
- **FR-008**: Customers MUST be able to view all reviews they have submitted
- **FR-009**: Providers MUST be able to view all reviews they have received (read-only)
- **FR-010**: Providers MUST be able to view their rating statistics (read-only)
- **FR-011**: Unauthenticated users MUST be able to view a provider's reviews and rating statistics
- **FR-012**: Admins MUST be able to view all reviews across the platform
- **FR-013**: Admins MUST be able to remove any review (moderation)
- **FR-014**: System MUST log all admin moderation actions (who, what, when, why)
- **FR-015**: Customers MUST be able to edit their review within 24 hours of submission
- **FR-016**: Customers MUST be able to delete their own review within 24 hours of submission
- **FR-017**: System MUST paginate review lists with configurable page size
- **FR-018**: System MUST support sorting reviews by rating and by date
- **FR-019**: System MUST support filtering reviews by provider and by rating score
- **FR-020**: System MUST emit events when a review is created, updated, or removed by admin (for future notification integration)
- **FR-021**: System MUST use optimized aggregation (not full-table scan) for rating statistics calculation
- **FR-022**: Provider rating stats MUST be included in provider profile responses

### Key Entities

- **Review**: Represents a single customer's rating and commentary about a service provider. Linked to exactly one booking, one customer, and one provider. Contains a numeric rating (1-5) and optional text comment.
- **ProviderRatingStats**: Cached aggregate of a provider's review metrics. Contains average rating, total review count, and per-star-level counts. Updated atomically whenever reviews are created, edited, or deleted. One-to-one relationship with provider profile.

## API Contract & DTOs

- **DTO-001**: CreateReviewDto — rating (1-5 integer), comment (optional, max 1000 chars), bookingId (UUID, must reference a completed booking owned by the customer)
- **DTO-002**: UpdateReviewDto — rating (1-5 integer, optional), comment (optional, max 1000 chars)
- **DTO-003**: ReviewResponseDto — id, bookingId, customerId, providerId, rating, comment, createdAt, updatedAt
- **DTO-004**: ProviderRatingStatsResponseDto — averageRating (decimal), totalReviews (integer), fiveStarCount, fourStarCount, threeStarCount, twoStarCount, oneStarCount
- **DTO-005**: ReviewFilterDto — pagination params, sortBy (rating/date), sortOrder (asc/desc), providerId (UUID, optional), rating (integer 1-5, optional)
- **SWAG-001**: All endpoints require JWT Bearer auth except public provider rating/review endpoints. Validation error responses include field-level messages. Request and response examples follow project Swagger conventions.

### Measurable Outcomes

- **SC-001**: Customers can submit a review in under 1 minute from a completed booking
- **SC-002**: Provider rating stats update within 2 seconds of a review being created, edited, or deleted
- **SC-003**: Public reviews page loads with rating stats and paginated review list in under 1 second for providers with up to 10,000 reviews
- **SC-004**: Admin moderation actions (review removal) complete in under 1 second and are permanently logged
- **SC-005**: System prevents duplicate review submissions with 100% accuracy (no duplicate reviews in the database)

## Assumptions

- Review edit/delete window is 24 hours from submission (a reasonable default when no specific window is defined)
- Deleted reviews are hard-deleted (not soft-deleted) unless the review was removed by admin, in which case it is logged
- Maximum comment length is 1000 characters (consistent with common platform standards)
- Provider rating stats are stored as a separate aggregate table (not calculated on-the-fly from reviews) to meet the performance requirement
- Existing Authentication Module (JWT), Booking Module (status validation), and Provider Profile Module (profile endpoint extension) are available as dependencies
- Customer and provider profile data (names/avatars) for review display will be provided by existing User and Provider Profile modules
- Review visibility is globally public — no private or friends-only review mode needed
- Email/push notification is out of scope for this feature; only event emission hooks are implemented
