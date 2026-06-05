# Data Model: Categories & Provider Profiles

## Entity Relationship Diagram

```
┌──────────────────┐       ┌──────────────────────┐       ┌──────────────────┐
│   ServiceCategory │       │   ProviderCategory    │       │  ProviderProfile  │
├──────────────────┤       ├──────────────────────┤       ├──────────────────┤
│ PK id: uuid      │◄──────│ FK categoryId: uuid   │──────►│ PK id: uuid      │
│ name: string     │       │ FK providerId: uuid   │       │ FK userId: uuid  │
│ description?     │       │ createdBy?: string    │       │ businessName?    │
│ icon?            │       │ createdAt: datetime   │       │ bio?             │
│ image?           │       └──────────────────────┘       │ profileImage?    │
│ isActive: bool   │                                       │ experienceYears? │
│ sortOrder: int   │       ┌──────────────────────┐       │ rating           │
│ createdAt        │       │   ProviderService     │       │ totalJobs: int   │
│ updatedAt        │       ├──────────────────────┤       │ ...              │
└──────────────────┘       │ PK id: uuid          │       │ createdAt        │
         │                 │ FK providerId: uuid  │◄──────│ updatedAt        │
         │                 │ FK serviceId: uuid   │       └──────────────────┘
         ▼                 │ price: decimal       │                │
┌──────────────────┐       │ ...                  │                │
│     Service      │       └──────────────────────┘                │
├──────────────────┤                                                │
│ PK id: uuid      │                                               │
│ FK categoryId    │                                               │
│ name: string     │                                               │
│ description?     │                                               ▼
│ ...              │                                      ┌──────────────────┐
│ createdAt        │                                      │       User       │
│ updatedAt        │                                      ├──────────────────┤
└──────────────────┘                                      │ PK id: uuid     │
                                                           │ role: enum      │
                                                           │ ...             │
                                                           └──────────────────┘
```

## Entities

### ServiceCategory (EXISTING — unchanged)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK, auto-generated | |
| name | string | UNIQUE, NOT NULL | Category name (e.g., "Plumbing") |
| description | varchar | NULLABLE | Optional description |
| icon | varchar | NULLABLE | Icon identifier/URL |
| image | varchar | NULLABLE | Category image URL |
| isActive | boolean | DEFAULT true | Soft-delete flag |
| sortOrder | integer | DEFAULT 0 | Display ordering |
| services | OneToMany→Service | | All services in this category |
| createdAt | datetime | Auto | |
| updatedAt | datetime | Auto | |

**Validation Rules**:
- `name`: Required, unique, 2-100 chars
- `description`: Optional, max 500 chars
- `icon`: Optional, max 255 chars
- `isActive`: Must be boolean

---

### ProviderCategory (NEW — join table)

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | uuid | PK, auto-generated | |
| providerId | uuid | FK→ProviderProfile.id, NOT NULL | Indexed |
| categoryId | uuid | FK→ServiceCategory.id, NOT NULL | Indexed |
| createdAt | datetime | Auto | |

**Unique Constraint**: `(providerId, categoryId)` — prevents duplicate assignments
**Indexes**: `providerId`, `categoryId`, composite `(providerId, categoryId)`
**Validation Rules**:
- `providerId`: Must reference existing `ProviderProfile`
- `categoryId`: Must reference existing `ServiceCategory`
- Deletion: `ON DELETE CASCADE` for both FKs

---

### ProviderProfile (EXISTING — add fields)

**New/Modified Fields**:

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| experienceYears | integer | NULLABLE, >= 0, <= 100 | NEW field |
| verificationStatus | varchar | DEFAULT 'pending' | EXISTING — enhance with enum |

**Full entity fields** (existing + new):
- `id` (uuid, PK)
- `userId` (uuid, FK→User, unique)
- `businessName` (varchar, nullable)
- `businessDescription` (varchar, nullable)
- `bio` (varchar, nullable)
- `profileImage` (varchar, nullable)
- `experienceYears` (integer, nullable) — **NEW**
- `rating` (decimal 3,2)
- `totalJobsCompleted` (integer, default 0)
- `totalEarnings` (decimal, default 0)
- `responseTimeMinutes` (integer, default 0)
- `isAvailable` (boolean, default false)
- `verificationStatus` (varchar, default 'pending')
- `address`, `latitude`, `longitude`, `serviceRadiusKm`
- `nationalId`, `nationalIdImage`, `licenseImage`
- `portfolioImages`, `workingHours`
- `createdAt`, `updatedAt`

**Validation Rules**:
- `experienceYears`: Optional, integer 0-100
- `bio`: Optional, max 2000 chars
- `profileImage`: Optional, valid URL string

---

### Service (EXISTING — unchanged)

| Field | Type | Constraints |
|-------|------|-------------|
| id | uuid | PK |
| categoryId | uuid | FK→ServiceCategory.id |
| name | string | NOT NULL |
| description | varchar | NULLABLE |
| basePrice | decimal | NULLABLE |
| isActive | boolean | DEFAULT true |
| sortOrder | integer | DEFAULT 0 |

---

## State Transitions

### Provider Verification Status

```
pending ──► under_review ──► verified
  │                            │
  └────► rejected ◄───────────┘
```

- `pending`: Initial state after application
- `under_review`: Admin is reviewing
- `verified`: Admin approved
- `rejected`: Admin rejected (can re-apply)

### Category Active Status

```
active ──► inactive (soft-delete)
  │
  └── (Admin toggle)
```

- Category deactivation does not remove provider assignments
- Inactive categories hidden from public listing endpoints
- Admin can reactivate

---

## Migration Plan

1. **New table**: `provider_categories` with:
   - `id` uuid PK
   - `provider_id` uuid FK → provider_profiles.id (CASCADE)
   - `category_id` uuid FK → service_categories.id (CASCADE)
   - Unique index on `(provider_id, category_id)`
   - Indexes on `provider_id` and `category_id`

2. **Alter table**: `provider_profiles`
   - ADD COLUMN `experience_years` integer NULLABLE

3. **Seed data**: Optional seed categories (Plumbing, Electrical, Cleaning, Carpentry, Painting, etc.)
