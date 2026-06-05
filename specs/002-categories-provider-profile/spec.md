# Feature Specification: Categories & Provider Profiles

**Feature Branch**: `002-categories-provider-profile`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description for Categories system and Provider Profile management.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Service Categorization (Priority: P1)

As an Admin, I want to manage service categories (Plumbing, Electrical, etc.) so that customers can easily browse services and providers can classify their expertise.

**Why this priority**: Categories are the primary navigation and filtering mechanism for the marketplace.

**Independent Test**: Can be verified by creating a category through the Admin API and confirming it appears in the public category list.

**Acceptance Scenarios**:

1. **Given** an Admin user, **When** they create a new category "Carpentry", **Then** the category is saved with its icon and description.
2. **Given** an existing category "Plumbing", **When** an Admin updates its description, **Then** the change is reflected immediately for all users.
3. **Given** a category "Cleaning", **When** an Admin deactivates it, **Then** it no longer appears in the active categories list for Customers.

---

### User Story 2 - Provider Professional Profile (Priority: P1)

As a Provider, I want to create and manage my professional profile (bio, experience, categories) so that I can showcase my skills to potential customers.

**Why this priority**: Essential for providers to participate in the marketplace and for customers to evaluate them.

**Independent Test**: Can be tested by submitting profile updates as a Provider and retrieving the updated profile data.

**Acceptance Scenarios**:

1. **Given** a user with the "Provider" role, **When** they complete their profile with bio and 5 years of experience, **Then** the profile is linked to their user account.
2. **Given** a Provider profile, **When** the provider selects "Plumbing" and "Electrical" categories, **Then** the relationship is persisted in the system.
3. **Given** an authenticated Provider, **When** they update their bio and profile image, **Then** the changes are saved successfully.

---

### User Story 3 - Provider Discovery (Priority: P2)

As a Customer, I want to browse and filter providers by service category so that I can find the right professional for my needs.

**Why this priority**: Core value proposition for customers finding service providers.

**Independent Test**: Can be tested by listing providers with a category filter and verifying that only matching providers are returned.

**Acceptance Scenarios**:

1. **Given** several providers in "Electrical" and "Cleaning", **When** a Customer filters by "Electrical", **Then** only electrical providers are shown.
2. **Given** a list of providers, **When** a Customer applies sorting by experience, **Then** providers are ordered correctly by years of experience.
3. **Given** a large number of providers, **When** a Customer requests the next page of results, **Then** the next set of providers is returned (Pagination).

---

### Edge Cases

- **Duplicate Category Names**: The system must prevent creating two categories with the same name.
- **Provider Role Check**: Ensure users with "Customer" role cannot create or manage a "Provider Profile".
- **Invalid Category IDs**: When a provider selects categories, the system must validate that all provided category IDs exist.
- **Deletion Impact**: If a category is deleted, ensure existing provider assignments are handled gracefully (e.g., restricted if active assignments exist).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow Admin users to Create, Read, Update, and Delete (CRUD) service categories.
- **FR-002**: Categories MUST have a unique name, optional description, icon, and an active status.
- **FR-003**: The system MUST support a Many-to-Many relationship between Providers and Categories.
- **FR-004**: Every user with the "Provider" role MUST have exactly one professional profile.
- **FR-005**: Provider Profiles MUST include bio, profile image, years of experience, and system-calculated stats (rating, jobs completed).
- **FR-006**: The system MUST allow Providers to select one or more categories they belong to.
- **FR-007**: The system MUST provide a public API for Customers to list and filter Providers by category.
- **FR-008**: The Provider listing API MUST support pagination and sorting by experience or rating.
- **FR-009**: The system MUST allow Admin users to verify Provider profiles or suspend them.
- **FR-010**: All profile and category management actions MUST be protected by Role-Based Access Control (RBAC).

### Key Entities *(include if feature involves data)*

- **Category**: Represents a type of service (e.g., Plumbing).
- **ProviderProfile**: Professional details for a provider user.
- **ProviderCategory**: Join entity linking Providers to Categories.

## API Contract & DTOs *(mandatory)*

- **DTO-001**: CreateCategoryDto (name, description, icon).
- **DTO-002**: UpdateProviderProfileDto (bio, experienceYears, profileImage).
- **DTO-003**: ProviderCategoryDto (categoryIds: string[]).
- **SWAG-001**: Categorized Swagger documentation for Categories (Public/Admin) and Providers (Public/Protected).
- **SWAG-002**: Filtering and Pagination schema documentation for `GET /providers`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Category management operations (Create/Update) complete in under 300ms.
- **SC-002**: Provider listing with category filtering returns results in under 500ms for up to 10,000 providers.
- **SC-003**: 100% of unauthorized profile update attempts (e.g., Customer trying to update Provider) are blocked.
- **SC-004**: Pagination and sorting logic is accurate across all provider search combinations.

## Assumptions

- Calculation of `averageRating` and `totalJobsCompleted` will be handled by future modules (Reviews/Jobs), but placeholders exist in this schema.
- Profile images are stored as URLs or file paths provided by an upload service.
- Verification status is manually toggled by Admins via the database or a future Admin dashboard.
