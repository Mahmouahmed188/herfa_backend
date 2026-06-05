# Research: Categories & Provider Profiles

## Unknown 1: ProviderCategory Entity Design

**Decision**: Create a direct `ProviderCategory` join table between `ProviderProfile` and `ServiceCategory`.

**Rationale**:
- Spec FR-003 explicitly requires Many-to-Many between Providers and Categories
- Existing `ProviderService` links providers to `Service` (sub-services), not categories
- A direct join enables simple category-level filtering without joining through `services` table
- Maintains backward compatibility with existing `ProviderService` → `Service` → `ServiceCategory` chain
- Independent concerns: `ProviderCategory` for category membership, `ProviderService` for pricing individual services

**Alternatives Considered**:
- Reusing `ProviderService`→`Service`→`ServiceCategory` chain: Adds unnecessary JOIN complexity for category-only queries; doesn't match spec's `ProviderCategory` entity requirement
- Adding `categoryId` directly to `ProviderProfile`: Violates normalization — one provider can belong to multiple categories

---

## Unknown 2: experienceYears Field

**Decision**: Add `experienceYears` column (integer, nullable) to `ProviderProfile` entity.

**Rationale**:
- Spec FR-005 explicitly lists "years of experience" as separate from bio or other fields
- Allows sorting providers by experience (FR-008, US-3 Scenario 2)
- Nullable to support existing providers who haven't set it

**Alternatives Considered**:
- Deriving from `createdAt`: Not accurate — a provider might have years of experience before joining the platform
- Storing in bio text field: Not sortable, violates data normalization

---

## Unknown 3: Provider Search Sorting

**Decision**:
- Sort by experience: `DESC` (most experienced first) as default
- Sort by rating: `DESC` (highest rated first) as default
- Support both directions explicitly via query param: `sortBy=experience&sortOrder=DESC`

**Rationale**:
- Customers naturally want to see most qualified providers first
- DESC is the intuitive default for both experience and rating
- Explicit `sortOrder` param provides flexibility

**Alternatives Considered**:
- ASC default: Counterintuitive — customers want best first
- Fixed sort: Too restrictive for marketplace use cases

---

## Unknown 4: Category Deletion Strategy

**Decision**: Soft-delete (deactivate) categories rather than hard-delete.

**Rationale**:
- Spec edge case: "If a category is deleted, ensure existing provider assignments are handled gracefully"
- `ServiceCategory` already has `isActive` boolean field
- Deactivating sets `isActive = false`, hiding it from public listings
- Existing `ProviderCategory` assignments remain for historical/reporting purposes
- Admin can still see inactive categories in admin panel
- Prevents orphaned references and data loss

**Alternatives Considered**:
- Hard delete with CASCADE: Data loss; breaks existing provider assignments
- Restrict deletion if active assignments exist: Blocks legitimate admin actions

---

## Unknown 5: Admin Verification/Suspension Ownership

**Decision**: Add verification/suspension endpoints to `ProvidersModule`, with admin guards. No delegation to `AdminModule` needed.

**Rationale**:
- Keeps provider-domain logic co-located in `ProvidersModule`
- Admins can access these via `RolesGuard` with `Admin`/`SuperAdmin` role
- Simpler than cross-module delegation
- Follows existing pattern: `AdminServicesController` exists in `ServicesModule`, not `AdminModule`

**Alternatives Considered**:
- `AdminModule` delegation: Unnecessary indirection; existing pattern keeps admin endpoints in feature modules
- Separate `VerificationModule`: Already exists for technician verification; provider verification is different domain

---

## Technology Choices

| Decision | Choice | Rationale |
|----------|--------|-----------|
| ORM | TypeORM (existing) | Already used across all modules; consistent |
| Validation | class-validator + class-transformer | Already used; required by constitution |
| API Docs | @nestjs/swagger | Already used; required by constitution |
| Auth Guards | JwtAuthGuard + RolesGuard | Already implemented; reusable |
| Database | PostgreSQL (existing) | UUIDs, timestamps, existing schema |
