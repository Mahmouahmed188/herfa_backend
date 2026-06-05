# Data Model: Address Management System

**Date**: 2026-06-05 | **Input**: [spec.md](spec.md), [research.md](research.md)

## Entity: Address

Represents a customer's service location. Owned by a single User.

### Table: `addresses`

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | uuid | PK, default `uuid_generate_v4()` | Primary key |
| userId | uuid | FK → users.id, NOT NULL, indexed | Owner of this address |
| label | varchar(100) | NOT NULL | e.g., "Home", "Work", "Villa" |
| fullAddress | text | NOT NULL | Full street address text |
| buildingNumber | varchar(50) | NOT NULL | Building number |
| floorNumber | integer | NULLABLE | Optional floor number |
| apartmentNumber | integer | NULLABLE | Optional apartment number |
| city | varchar(100) | NOT NULL | City name |
| area | varchar(100) | NOT NULL | District/area name |
| latitude | decimal(10,7) | NOT NULL, check -90 to 90 | WGS84 latitude |
| longitude | decimal(11,7) | NOT NULL, check -180 to 180 | WGS84 longitude |
| isDefault | boolean | NOT NULL, default false | Only one true per user |
| createdAt | timestamp | NOT NULL, default now() | Auto-set |
| updatedAt | timestamp | NOT NULL, default now(), on update now() | Auto-set |

### Indexes

- `idx_addresses_user_id` on `userId` — fast lookup of user's addresses
- `idx_addresses_user_default` on `(userId, isDefault)` — efficient default address lookup
- `idx_addresses_created_at` on `createdAt` — sorting by creation date

### Relationships

```
User (1) ──→ Address (many)
  userId ←── userId (FK)
```

- **User**: The customer who owns the address. Cascading delete not configured (addresses preserved if user is soft-deleted or deactivated).
- **No inverse relation on User entity** — follows the pattern of Review (no `@OneToMany` from User to Review).

### Validation Rules

| Field | Rule | Error Code |
|-------|------|------------|
| label | Required, max 100 chars | ADDRESS_LABEL_REQUIRED / ADDRESS_LABEL_TOO_LONG |
| fullAddress | Required | ADDRESS_FULL_ADDRESS_REQUIRED |
| buildingNumber | Required | ADDRESS_BUILDING_NUMBER_REQUIRED |
| city | Required | ADDRESS_CITY_REQUIRED |
| area | Required | ADDRESS_AREA_REQUIRED |
| latitude | Required, -90 to 90 | ADDRESS_LATITUDE_INVALID |
| longitude | Required, -180 to 180 | ADDRESS_LONGITUDE_INVALID |
| isDefault | Only one true per userId | ADDRESS_DEFAULT_ALREADY_EXISTS (application-level) |

## State Transitions

### Address Lifecycle

```
Created ──→ Updated ──→ Deleted
  │            │
  └── Set as default ──┘
```

- **Created**: POST /addresses — initial state, `isDefault: false` unless explicitly set
- **Updated**: PATCH /addresses/:id — any field can change
- **Set as Default**: PATCH /addresses/:id/set-default — un-sets any existing default for this user, sets this address as default
- **Deleted**: DELETE /addresses/:id — hard delete from database

### Address Ownership Rules

```
Customer ──→ Own Addresses (CRUD)
Admin    ──→ View Addresses (read-only)
Provider ──→ No access
```
