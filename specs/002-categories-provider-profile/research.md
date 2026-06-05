# Research: Categories & Provider Profiles

## Decision: Many-to-Many Relationship via Implicit/Explicit Join Table

**Rationale**: Providers need to belong to multiple categories. Prisma supports implicit many-to-many relationships, which simplifies queries. However, if we need to store additional data on the relationship later (e.g., primary category, date of assignment), we will transition to an explicit join table (`ProviderCategory`). For now, an implicit relationship is sufficient and cleaner.

**Alternatives considered**:
- **JSON Column**: Rejected because it's difficult to query and index for filtering providers by category.
- **One-to-Many**: Rejected because a provider can have multiple skill sets (e.g., Plumbing and Electrical).

## Decision: Pagination and Filtering Logic

**Rationale**: To meet performance goals (SC-002), we will use cursor-based or offset-based pagination in the `ProvidersService`. Filtering by `categoryId` will be performed via a Prisma `where` clause that checks the categories relation.

**Implementation**: The `GET /providers` endpoint will accept `page`, `limit`, `categoryId`, `sortBy`, and `sortOrder` query parameters.

## Decision: Role-Based Access Control (RBAC) Strategy

**Rationale**: Aligns with Constitution P8 and FR-010. We will use the existing `RolesGuard` and `@Roles()` decorator.
- **Categories**: `POST`, `PATCH`, `DELETE` restricted to `ADMIN`. `GET` is public or restricted to authenticated users (to be determined by platform policy).
- **Profiles**: `PATCH /providers/profile` restricted to `PROVIDER` and specifically the owner of the profile.

## Decision: Profile Statistics Placeholder

**Rationale**: `averageRating` and `totalJobsCompleted` are calculated fields. For this phase, they will be stored as columns with default values (0.0 and 0 respectively) to establish the contract, while the logic for updating them will be part of the future Reviews and Jobs modules.
