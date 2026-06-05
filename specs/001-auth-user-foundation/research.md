# Research: Authentication and User Foundation

## Decision: Dual-token Strategy (Access + Refresh)

**Rationale**: To enhance security and user experience. Access tokens will have a short lifespan (e.g., 15 minutes) to minimize the window of misuse if stolen. Refresh tokens will have a longer lifespan (e.g., 7 days) and will be stored securely (e.g., in an HTTP-only cookie or as a hashed value in the database) to allow users to stay logged in without re-entering credentials.

**Alternatives considered**:
- **Single Access Token**: Rejected because long-lived tokens are insecure, and short-lived tokens without refresh require frequent re-login.
- **Session-based Auth (Cookies)**: Rejected because JWTs are more suitable for mobile apps and distributed systems (Herfa has both web and mobile).

## Decision: Prisma ORM for User Persistence

**Rationale**: The project explicitly requested Prisma. Prisma provides a type-safe client and easy migration management, which aligns with P1 (Database First) and P9 (Database Standards).

**Alternatives considered**:
- **TypeORM**: Standard in NestJS but Prisma is preferred for its superior DX and type safety in this specific feature request.

## Decision: UUIDs and Timestamps in Prisma

**Rationale**: Aligns with Constitution P9. UUIDs prevent ID enumeration and are better for distributed systems. `createdAt` and `updatedAt` are mandatory for all tables.

**Implementation**: Use `dbgenerated("gen_random_uuid()")` or `@default(uuid())` in `schema.prisma`.

## Decision: RBAC with NestJS Guards

**Rationale**: Standard way to implement role-based access control in NestJS. A custom `@Roles()` decorator and a `RolesGuard` will be used to protect endpoints based on the `UserRole` enum (Customer, Provider, Admin).

**Alternatives considered**:
- **ACL (Access Control List)**: More complex than needed for a simple three-role system.
- **CASL**: Powerful but overkill for this foundational phase.
