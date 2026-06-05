# Data Model: Authentication and User Foundation

## User Entity

Represents a person registered on the Herfa platform.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | Primary Key, @default(uuid()) | Unique identifier for the user |
| firstName | String | @map("first_name") | User's first name |
| lastName | String | @map("last_name") | User's last name |
| email | String | Unique, @map("email") | User's email address |
| phone | String | Unique, @map("phone") | User's phone number |
| passwordHash | String | @map("password_hash") | Bcrypt hashed password |
| role | Enum | UserRole, Default: CUSTOMER | Role of the user in the system |
| isActive | Boolean | Default: true, @map("is_active") | Whether the account is active |
| createdAt | DateTime | Default: now(), @map("created_at") | Record creation timestamp |
| updatedAt | DateTime | UpdatedAt, @map("updated_at") | Record update timestamp |

## Enums

### UserRole
- `CUSTOMER`
- `PROVIDER`
- `ADMIN`

## Relationships
- None in this foundational phase. Future features (Providers, Bookings) will link to the `User` entity.
