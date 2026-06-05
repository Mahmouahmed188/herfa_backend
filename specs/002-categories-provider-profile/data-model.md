# Data Model: Categories & Provider Profiles

## Category Entity

Represents a classification for services.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | @id, @default(uuid()) | Unique identifier |
| name | String | @unique | Name of the category (e.g., Plumbing) |
| description | String? | | Optional summary of the category |
| icon | String? | | URL or identifier for the category icon |
| isActive | Boolean | @default(true) | Whether the category is visible to users |
| createdAt | DateTime | @default(now()) | Timestamp |
| updatedAt | DateTime | @updatedAt | Timestamp |
| profiles | ProviderProfile[] | Many-to-Many | Linked provider profiles |

## ProviderProfile Entity

Professional details for a user with the `PROVIDER` role.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | @id, @default(uuid()) | Unique identifier |
| userId | UUID | @unique | Foreign Key to `User.id` |
| bio | String? | | Professional biography |
| profileImage | String? | | URL to the professional profile image |
| experienceYears | Int | @default(0) | Number of years in the profession |
| averageRating | Decimal | @default(0.0) | Calculated rating from reviews |
| totalJobsCompleted | Int | @default(0) | Count of completed jobs |
| isVerified | Boolean | @default(false) | Admin-controlled verification status |
| createdAt | DateTime | @default(now()) | Timestamp |
| updatedAt | DateTime | @updatedAt | Timestamp |
| categories | Category[] | Many-to-Many | Linked categories |
| user | User | 1-to-1 | Relation to User entity |

## Relationships

### User ↔ ProviderProfile
- **Type**: 1-to-1
- **Ownership**: Every user with `PROVIDER` role should have a `ProviderProfile`. Users with `CUSTOMER` or `ADMIN` roles do not.

### ProviderProfile ↔ Category
- **Type**: Many-to-Many
- **Implementation**: Implicit Prisma relation (creates `_CategoryToProviderProfile` join table).
