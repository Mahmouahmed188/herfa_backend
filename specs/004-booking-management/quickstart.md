# Quickstart: Booking Management Module

## Overview

This feature adds a complete Booking Management System to the Herfa platform. Follow this guide to get up and running.

## Prerequisites

- NestJS 10.3 project with TypeORM 0.3
- Existing modules: Auth, Users, Services, Provider Profiles
- PostgreSQL or SQLite database configured

## Files Created

### Source Code (`src/`)

| File | Purpose |
|------|---------|
| `src/entities/booking.entity.ts` | Booking entity definition |
| `src/entities/booking-status-history.entity.ts` | Status history audit entity |
| `src/modules/bookings/bookings.module.ts` | NestJS module with TypeORM + EventEmitter imports |
| `src/modules/bookings/bookings.controller.ts` | Three controller classes: customer, provider, admin |
| `src/modules/bookings/bookings.service.ts` | Business logic: CRUD, status transitions, history, filtering |
| `src/modules/bookings/dto/create-booking.dto.ts` | Create booking validation & Swagger |
| `src/modules/bookings/dto/booking-response.dto.ts` | Booking response shape & Swagger |
| `src/modules/bookings/dto/booking-filter.dto.ts` | Filter/pagination query params & Swagger |
| `src/modules/bookings/dto/update-status.dto.ts` | Status update validation |
| `src/modules/bookings/dto/cancel-booking.dto.ts` | Cancel reason validation |
| `src/modules/bookings/guards/booking-ownership.guard.ts` | Ownership verification guard |

### Documentation (`specs/004-booking-management/`)

| File | Purpose |
|------|---------|
| `plan.md` | Implementation plan with technical context |
| `spec.md` | Feature specification |
| `research.md` | Architecture research & decisions |
| `data-model.md` | Entity definitions, relationships, state machine |
| `contracts/bookings.contract.md` | REST API contracts |
| `contracts/booking-history.contract.md` | History audit contract |
| `contracts/events.contract.md` | Event emission contracts |
| `checklists/requirements.md` | Quality validation checklist |

## Implementation Order

1. **Entities**: Create `booking.entity.ts` and `booking-status-history.entity.ts` in `src/entities/`, export from `src/entities/index.ts`
2. **Module**: Create `src/modules/bookings/` with `bookings.module.ts` importing `TypeOrmModule.forFeature([Booking, BookingStatusHistory])`
3. **Service**: Implement `BookingsService` with all CRUD, status transitions, history recording, filtering
4. **DTOs**: Create all DTOs with class-validator validation and Swagger decorators
5. **Controllers**: Implement customer, provider, and admin controllers
6. **Guards**: Create `BookingOwnershipGuard` for data isolation
7. **Swagger**: Decorate all endpoints with `@ApiTags`, `@ApiOperation`, `@ApiResponse`
8. **Tests**: Write unit tests for service (state machine, validation) and controller (auth, guards, responses)
9. **Prisma**: Update `prisma/schema.prisma` with Booking and BookingStatusHistory models

## Key Design Decisions

- **TypeORM** (primary) for data access, not Prisma
- **State machine pattern** for status transitions
- **Event emitter** for loose-coupled notification integration
- **Ownership guard** pattern for data isolation by role
- **UUID booking numbers** with `BKG-` prefix for human readability

## Verification

```bash
# Run unit tests
npm run test -- --testPathPattern=bookings

# Run e2e tests
npm run test:e2e -- --testPathPattern=bookings

# Lint
npm run lint

# Build
npm run build
```

## Dependencies

This module relies on:
- `AuthModule` for JWT authentication guards
- `UsersModule` for user entity and role resolution
- `ServicesModule` for service existence validation
- `ProvidersModule` for provider profile and service ownership validation
