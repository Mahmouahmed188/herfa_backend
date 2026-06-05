---
description: "Task list for Address Management System feature implementation"
---

# Tasks: Address Management System

**Input**: Design documents from `specs/006-address-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Not requested — no test tasks generated. Independent test criteria documented per story.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single NestJS project: `src/` at repository root
- Entities: `src/entities/`
- Module: `src/modules/addresses/`
- Shared: `src/common/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify environment and branch readiness

- [X] T001 Verify working on feature branch `006-address-management` and dev server (`npm run start:dev`) starts without errors

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core entity, DTOs, guard, and module structure. MUST complete before ANY user story.

- [X] T002 [P] Create `src/entities/address.entity.ts` with `@Entity('addresses')` — fields: id (uuid PK), userId (FK→users, indexed), label (varchar 100), fullAddress (text), buildingNumber (varchar 50), floorNumber (int, nullable), apartmentNumber (int, nullable), city (varchar 100), area (varchar 100), latitude (decimal 10,7), longitude (decimal 11,7), isDefault (boolean, default false), createdAt, updatedAt. Add @ManyToOne(() => User) relation for userId. Add indexes on userId, (userId, isDefault), createdAt
- [X] T003 [P] Create `src/modules/addresses/dto/create-address.dto.ts` with class-validator and @nestjs/swagger decorators per DTO-001 contracts — label (@IsString, @MaxLength(100)), fullAddress (@IsString), buildingNumber (@IsString), floorNumber (@IsOptional, @IsInt, @Min(0)), apartmentNumber (@IsOptional, @IsInt, @Min(0)), city (@IsString, @MaxLength(100)), area (@IsString, @MaxLength(100)), latitude (@IsNumber, @Min(-90), @Max(90)), longitude (@IsNumber, @Min(-180), @Max(180))
- [X] T004 [P] Create `src/modules/addresses/dto/update-address.dto.ts` — same fields as CreateAddressDto but all optional (@IsOptional on every field)
- [X] T005 [P] Create `src/modules/addresses/dto/address-response.dto.ts` with all fields (id, userId, label, fullAddress, buildingNumber, floorNumber, apartmentNumber, city, area, latitude, longitude, isDefault, createdAt, updatedAt) and @ApiProperty with descriptions
- [X] T006 [P] Create `src/modules/addresses/dto/address-filter.dto.ts` extending `PaginationDto` from `src/common/dto/pagination.dto.ts` — add sortBy (createdAt | isDefault), sortOrder (ASC | DESC). Use @IsEnum, @ApiPropertyOptional with defaults (sortBy: createdAt, sortOrder: DESC)
- [X] T007 [P] Create `src/modules/addresses/dto/admin-address-filter.dto.ts` extending `AddressFilterDto` — add userId field with @IsUUID() and @ApiProperty (required)
- [X] T008 [P] Create `src/modules/addresses/guards/address-ownership.guard.ts` implementing CanActivate — extract userId from request params, lookup address via @InjectRepository(Address), verify address.userId === user.id or user.role is admin, throw ForbiddenException otherwise. Follow BookingOwnershipGuard pattern
- [X] T009 Create `src/modules/addresses/addresses.module.ts` — add TypeOrmModule.forFeature([Address]), register controllers (AddressesController, AdminAddressesController) and providers (AddressesService), exports [AddressesService]
- [X] T010 Register `AddressesModule` in the application's root module (likely `src/app.module.ts`)

**Checkpoint**: Foundation ready — entity, DTOs, guard, module all defined. User story implementation can begin.

---

## Phase 3: User Story 1 — Customer manages saved service addresses (Priority: P1) 🎯 MVP

**Goal**: Customer can create, view, update, delete, and set default addresses. Addresses are owned per-user and only accessible by the owner.

**Independent Test**: Authenticated customer creates address (POST /addresses → 201), lists (GET /addresses → paginated list), sets as default (PATCH /addresses/:id/set-default → isDefault: true), verifies old default unset, updates (PATCH /addresses/:id → 200), deletes (DELETE /addresses/:id → 204), verifies 404 on re-fetch. Ownership check: access another user's address → 403.

### Service Layer (all in `src/modules/addresses/addresses.service.ts`)

- [X] T011 [US1] Implement `AddressesService.create(userId, dto)` — validate input, create Address record with `isDefault: false`, if `isDefault` requested (via set-default flow), unset any existing default. Use NestJS Logger. Return saved address
- [X] T012 [US1] Implement `AddressesService.findAllByUser(userId, filter)` — query addresses WHERE userId matches, with pagination (page/limit from filter), sorting (default addresses first, then by createdAt DESC). Return paginated `{ data, meta }`
- [X] T013 [US1] Implement `AddressesService.findOne(id, userId)` — find address by id, verify ownership (throw NotFoundException if not found, ForbiddenException if wrong user). Return AddressResponseDto
- [X] T014 [US1] Implement `AddressesService.update(id, userId, dto)` — find + verify ownership, apply partial updates, save. Return updated address
- [X] T015 [US1] Implement `AddressesService.delete(id, userId)` — find + verify ownership, hard-delete from DB. Return void
- [X] T016 [US1] Implement `AddressesService.setDefault(id, userId)` — find + verify ownership, unset any existing default for this user (set isDefault=false on current default), set this address as default (isDefault=true), save both changes (transaction). Return updated address

### Controller (`src/modules/addresses/addresses.controller.ts`)

- [X] T017 [US1] Create `AddressesController` — `@Controller('addresses')`, `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(UserRole.CUSTOMER)`, `@ApiBearerAuth()`, `@ApiTags('Addresses')`. Endpoints:
  - `POST /` → create
  - `GET /` → list (with AddressFilterDto query)
  - `GET /:id` → findOne
  - `PATCH /:id` → update (with UpdateAddressDto)
  - `DELETE /:id` → delete (return 204)
  - `PATCH /:id/set-default` → setDefault

  Add @ApiOperation summaries and @ApiResponse for 200/201/204/400/401/403/404 on each endpoint.

**Checkpoint**: US1 complete — customers can fully manage their addresses. MVP ready.

---

## Phase 4: User Story 2 — Customer selects address during booking (Priority: P2)

**Goal**: Customer can pick a saved address or use their default when creating a booking. Booking stores a snapshot so future address changes don't affect historical records.

**Independent Test**: Customer with saved addresses creates a booking with `addressId` → booking snapshot fields populated. Updates address → booking snapshot unchanged.

### Integration Preparation

- [X] T018 [P] [US2] Add `getDefaultAddress(userId)` and `getAddressById(id, userId)` methods to `AddressesService` — public helpers for the Bookings module to consume. Return address data for snapshot population
- [X] T019 [US2] Create integration helper in `src/modules/addresses/addresses.integration.ts` (or extend service) — export function `toAddressSnapshot(address)` that maps Address entity fields to the Booking's snapshot columns (addressLine ← fullAddress, city, latitude, longitude). Future-proof: normalize format for any consumer
- [X] T020 [US2] Document integration contract in `specs/006-address-management/contracts/integration.md` — specify how the Bookings module can consume saved addresses (import AddressesService, call getDefaultAddress/getAddressById, call toAddressSnapshot, populate booking snapshot fields). Note: Booking entity not modified — snapshot fields already exist

**Checkpoint**: US2 integration points documented. Actual booking-module changes are a separate future task (cross-module dependency).

---

## Phase 5: User Story 3 — Admin views customer addresses for support (Priority: P3)

**Goal**: Admin can browse customer addresses read-only.

**Independent Test**: Admin logs in → GET /admin/addresses?userId=<id> → paginated list. GET /admin/addresses/:id → single address. POST/PATCH/DELETE on admin routes → 404 (no route) or 403.

### Service Layer (extend `AddressesService`)

- [X] T021 [P] [US3] Implement `AddressesService.adminFindAll(filter)` — query addresses by userId from filter, paginated, sorted by createdAt DESC. No ownership check (admin bypass)
- [X] T022 [P] [US3] Implement `AddressesService.adminFindOne(id)` — find address by id, no ownership check. Throw NotFoundException if not found

### Admin Controller (`src/modules/addresses/admin-addresses.controller.ts`)

- [X] T023 [US3] Create `AdminAddressesController` — `@Controller('admin/addresses')`, `@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)`, `@ApiBearerAuth()`, `@ApiTags('Admin Addresses')`. Endpoints:
  - `GET /` → adminFindAll (with AdminAddressFilterDto query — requires userId)
  - `GET /:id` → adminFindOne

  Add @ApiOperation summaries and @ApiResponse for 200/400/401/403/404.

**Checkpoint**: US3 complete — admin can view customer addresses for support.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, validation, and build verification.

- [X] T024 [P] Verify entity auto-registration — confirm `Address` is discovered by TypeORM glob pattern (`src/entities/*.entity.ts`)
- [X] T025 Run full build check: `npm run build` — confirm no TypeScript compilation errors
- [X] T026 Run quickstart.md validation — verify all 8 API endpoints respond correctly, all US1 acceptance scenarios pass
- [X] T027 [P] Verify backward compatibility — no existing entities (User, Booking, Review, etc.) modified
- [X] T028 [P] Verify provider users receive 403 on all address endpoints (FR-008)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 Customer manages addresses (Phase 3)**: Depends on Phase 2 — No dependencies on other stories ⭐ MVP
- **US2 Booking address integration (Phase 4)**: Depends on Phase 2 + US1 — Requires AddressesService methods but is a separate module (Bookings) integration prep
- **US3 Admin views addresses (Phase 5)**: Depends on Phase 2 — Reads only, independent of all stories
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) — No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 (uses AddressesService helpers) and is an integration prep task; actual Booking module changes are separate
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) — Independent implementation (reads only)

### Within Each User Story

- Entities/DTOs/guards completed in Foundational Phase
- Service methods before controller endpoints
- Swagger documentation with each endpoint
- Story complete before moving to next priority

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel (T002–T008 are independent files)
- US1 and US3 can start in parallel after Phase 2 completes (they edit different service methods and controller files)
- US2 depends on US1 service layer but is independent of US3
- All Polish tasks marked [P] can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all entity + DTO + guard tasks together:
Task: "Create src/entities/address.entity.ts"
Task: "Create create-address.dto.ts"
Task: "Create update-address.dto.ts"
Task: "Create address-response.dto.ts"
Task: "Create address-filter.dto.ts"
Task: "Create admin-address-filter.dto.ts"
Task: "Create guards/address-ownership.guard.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (customer manages addresses)
4. **STOP and VALIDATE**: Test US1 independently — create, list, get, update, set-default, delete, ownership check
5. Deploy/demo if ready — customers get address management

### Incremental Delivery

1. **MVP** (Phase 1 + 2 + 3): Customers can manage their addresses with full CRUD + default
2. **Admin Support** (Phase 5): Admin can view customer addresses for support
3. **Booking Integration** (Phase 4): Address integration prep documented; actual Booking changes in separate feature

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + Phase 2 together (all hands on foundational)
2. Once Foundational is done:
   - Developer A: US1 (customer CRUD + set-default)
   - Developer B: US3 (admin read-only)
3. After Developer A finishes US1: Developer A handles US2 (integration prep)
4. Phase 6: Polish — any dev handles final checks

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to a specific user story for traceability
- Each user story should be independently completable and testable
- Tests were not requested — no test tasks included
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- US2 (Booking Integration) is preparation/documentation only — actual Booking module changes are a separate cross-module feature
- The existing Booking entity already has snapshot fields (addressLine, city, latitude, longitude) — no schema change needed for snapshots
- All entities auto-discovered by TypeORM glob pattern — no migration step needed (synchronize: true)
