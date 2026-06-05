# Implementation Plan: Address Management System

**Branch**: `006-address-management` | **Date**: 2026-06-05 | **Spec**: [specs/006-address-management/spec.md](specs/006-address-management/spec.md)

**Input**: Feature specification from `specs/006-address-management/spec.md`

## Summary

Customers can create, manage, and organize multiple service addresses (Home, Work, Villa, etc.) for use during booking. Each address includes geocoordinates, a default flag (one per customer), and full location details. Addresses are owned per-user with strict access controls. Booking integration stores address snapshots (not live FKs) for immutable historical records. The feature extends the existing Booking entity which already has address snapshot fields.

## Technical Context

**Language/Version**: NestJS 10 / Node.js 20

**Primary Dependencies**: TypeORM 0.3, class-validator, class-transformer, @nestjs/swagger 7

**Storage**: PostgreSQL (UUID primary keys) — dev uses SQLite via better-sqlite3

**Testing**: Jest (Unit & Integration via supertest)

**Target Platform**: Backend API (NestJS)

**Project Type**: Web-service (feature-as-NestJS-module)

**Performance Goals**: SC-002: Address list page loads <500ms for 50 addresses; SC-003: Default address lookup <200ms

**Constraints**: REST conventions, UUIDs only, JWT Bearer auth, structured error responses

**Scale/Scope**: Herfa Platform — Customer/Admin roles, marketplace context

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] P1: Database schema defined? — `Address` entity designed: id, userId, label, fullAddress, buildingNumber, floorNumber, apartmentNumber, city, area, latitude, longitude, isDefault, timestamps. Indexes on userId, isDefault, and composite [userId, isDefault].
- [x] P2: Clean Architecture followed (Controller -> Service -> Repository)? — TypeORM repository pattern throughout; AddressRepository via @InjectRepository.
- [x] P3: Dedicated NestJS module planned? — `src/modules/addresses/` new module registered in AppModule.
- [x] P4/P6: DTOs & Swagger decorators included? — 6 DTOs with class-validator + @nestjs/swagger defined in contracts/.
- [x] P7/P8: JWT/Roles/Guards identified? — JwtAuthGuard, RolesGuard, custom AddressOwnershipGuard.
- [x] P9: PostgreSQL UUIDs & Timestamps included? — uuid PK, createdAt/updatedAt on entity.
- [x] P10/P11: Structured Errors & Logging planned? — Global AllExceptionsFilter + NestJS Logger in service.
- [x] P15: All 12 workflow steps accounted for? — All 6 user stories mapped (implementation in tasks.md).

## Project Structure

### Documentation (this feature)

```text
specs/006-address-management/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output — DTO specs
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── entities/
│   └── address.entity.ts              # NEW: Address entity with User relation
├── modules/
│   └── addresses/
│       ├── addresses.module.ts         # NEW: NestJS module
│       ├── addresses.service.ts        # NEW: business logic
│       ├── addresses.controller.ts     # NEW: customer endpoints
│       ├── admin-addresses.controller.ts # NEW: admin read-only endpoints
│       ├── dto/
│       │   ├── create-address.dto.ts       # NEW
│       │   ├── update-address.dto.ts       # NEW
│       │   ├── address-response.dto.ts     # NEW
│       │   ├── address-filter.dto.ts       # NEW
│       │   └── admin-address-filter.dto.ts # NEW
│       └── guards/
│           └── address-ownership.guard.ts  # NEW: ownership check
└── common/
    └── dto/
        └── pagination.dto.ts              # REUSE: PaginationDto as base for AddressFilterDto
```

**Structure Decision**: Single NestJS backend project with feature module in `src/modules/addresses/`, entity in `src/entities/`, shared infrastructure in `src/common/`. Follows existing codebase conventions (reviews, bookings patterns).

## Complexity Tracking

> No constitution violations — design follows existing conventions exactly.
