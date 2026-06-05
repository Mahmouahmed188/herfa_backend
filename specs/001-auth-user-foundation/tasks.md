# Tasks: Authentication and User Foundation

**Input**: Design documents from `/specs/001-auth-user-foundation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests are included as per the feature specification requirement.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency setup

- [x] T001 Create project structure for Auth and Users modules per plan.md
- [x] T002 Install authentication dependencies: @nestjs/passport passport passport-jwt @types/passport-jwt bcrypt @types/bcrypt
- [x] T003 Install persistence dependencies: prisma @prisma/client
- [x] T004 [P] Configure Prisma in the project and initialize schema.prisma

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core persistence and utility infrastructure

**⚠️ CRITICAL**: Must complete before user stories

- [x] T005 Define User model in prisma/schema.prisma (P1/P9)
- [x] T006 Generate database migration and Prisma Client: npx prisma migrate dev --name init_auth (P15)
- [x] T007 [P] Implement Bcrypt hashing service in src/modules/auth/bcrypt.service.ts (P7)
- [x] T008 [P] Setup global HTTP exception filter for structured errors in src/common/filters/http-exception.filter.ts (P10)
- [x] T009 [P] Initialize AuthModule and UsersModule in src/modules/

**Checkpoint**: Persistence and core utilities ready

---

## Phase 3: User Story 1 - Secure User Registration (Priority: P1) 🎯 MVP

**Goal**: Allow Customers and Providers to create accounts

**Independent Test**: Register a new user via POST /auth/register and verify the record in the database.

### Implementation for User Story 1

- [x] T010 [P] [US1] Create RegisterUserDto with validation in src/modules/auth/dto/register-user.dto.ts (P4)
- [x] T011 [P] [US1] Create UserProfileDto for responses in src/modules/users/dto/user-profile.dto.ts (P4)
- [x] T012 [US1] Implement registration logic in AuthService.register() in src/modules/auth/auth.service.ts
- [x] T013 [US1] Implement registration endpoint in AuthController.register() in src/modules/auth/auth.controller.ts (P5)
- [x] T014 [US1] Add Swagger documentation for registration in AuthController (P6)
- [x] T015 [US1] Create unit tests for registration in src/modules/auth/auth.service.spec.ts (P15)

**Checkpoint**: Registration is functional

---

## Phase 4: User Story 2 - Secure Authentication and Session Management (Priority: P1)

**Goal**: Secure Login, Token Refresh, and Logout

**Independent Test**: Login with credentials, receive tokens, and successfully refresh tokens.

### Implementation for User Story 2

- [x] T016 [P] [US2] Create LoginDto with validation in src/modules/auth/dto/login.dto.ts (P4)
- [x] T017 [US2] Implement JWT token generation (Access/Refresh) in src/modules/auth/auth.service.ts (P7)
- [x] T018 [US2] Implement Login and Refresh logic in AuthService (P7)
- [x] T019 [US2] Implement Passport JWT Strategy in src/modules/auth/strategies/jwt.strategy.ts (P7)
- [x] T020 [US2] Implement Login, Refresh, and Logout endpoints in AuthController (P5)
- [x] T021 [US2] Add Swagger documentation for auth endpoints (P6)
- [x] T022 [US2] Create unit tests for login and refresh flows (P15)

**Checkpoint**: Authentication system is fully functional

---

## Phase 5: User Story 3 - Profile Management (Priority: P2)

**Goal**: View and update authenticated user profile with RBAC

**Independent Test**: Retrieve current user profile and update fields using Access Token.

### Implementation for User Story 3

- [x] T023 [P] [US3] Create UpdateUserProfileDto in src/modules/users/dto/update-user-profile.dto.ts (P4)
- [x] T024 [US3] Implement profile retrieval and update logic in src/modules/users/users.service.ts (P2)
- [x] T025 [P] [US3] Implement Role Guard and @Roles() decorator in src/common/guards/roles.guard.ts (P8)
- [x] T026 [US3] Implement UsersController endpoints GET /me and PATCH /me in src/modules/users/users.controller.ts (P5)
- [x] T027 [US3] Add Swagger documentation for user endpoints (P6)
- [x] T028 [US3] Create unit tests for user profile management (P15)

**Checkpoint**: Profile management and RBAC are functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and compliance

- [x] T029 Implement logging for critical auth actions using NestJS Logger (P11)
- [x] T030 Final verification of API contracts and Swagger documentation completeness (P15)
- [x] T031 Run integration tests for full auth-to-profile flow (P15)

---

## Dependencies & Execution Order

1. **Phase 1 & 2** are blocking prerequisites.
2. **Phase 3 (Registration)** must complete before **Phase 4 (Login)** can be fully tested.
3. **Phase 4 (Auth)** must complete before **Phase 5 (Profile)** as profile endpoints require authentication.
4. **Phase 6** is performed after all user stories are implemented.

## Parallel Opportunities

- T002, T003, T004 (Installations and Prisma config)
- T007, T008, T009 (Utilities and Module setup)
- T010, T011 (DTOs for US1)
- T016 (DTO for US2)
- T023, T025 (DTO and Guard for US3)

## Implementation Strategy

1. **MVP First**: Complete Phases 1, 2, and 3 to allow user onboarding.
2. **Incremental Delivery**: Add Phase 4 for secure session management, then Phase 5 for profile control.
3. **Validation**: Each user story phase ends with a checkpoint and unit tests.
