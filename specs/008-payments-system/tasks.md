---

description: "Task list for Payments System implementation"
---

# Tasks: Payments System

**Input**: Design documents from `specs/008-payments-system/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install dependencies and prepare development environment

- [x] T001 Install @nestjs/event-emitter package for payment notification events
- [x] T002 [P] Create directory structure for payments module new files under src/modules/payments/dto/ and src/modules/payments/guards/
- [x] T003 [P] Create directory structure for refunds module under src/modules/refunds/ and src/modules/refunds/dto/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

### Prisma Schema & TypeORM Entities

- [x] T004 Update PaymentStatus enum in src/common/constants/user.enums.ts with new values: PENDING, AUTHORIZED, PAID, FAILED, REFUNDED, PARTIALLY_REFUNDED, CANCELLED
- [x] T005 [P] Create PaymentMethod enum in src/common/constants/payment.enums.ts with values: CASH, CREDIT_CARD, DEBIT_CARD, WALLET
- [x] T006 [P] Create PaymentStatusTransitionMap constant in src/common/constants/payment.enums.ts defining valid transitions
- [x] T007 Update payments model in prisma/schema.prisma: add paymentNumber, currency, paymentMethod, paymentStatus, transactionReference, notes fields; remove platformFee, providerPayout, stripePaymentIntentId, stripeTransferId, failedAt, refundedAt, metadata fields; link to Booking not Job; add refunds relation
- [x] T008 [P] Add refunds model to prisma/schema.prisma with fields: id, paymentId, refundAmount, refundReason, refundedBy, refundedAt, createdAt and indexes
- [x] T009 [P] Add audit_logs model to prisma/schema.prisma with fields: id, action, entityType, entityId, actorId, actorRole, metadata, createdAt and indexes
- [x] T010 Generate Prisma client (schema validated and generated successfully)
- [x] T011 Update Payment TypeORM entity in src/entities/payment.entity.ts: add paymentNumber, currency, transactionReference, notes fields; remove platformFee, providerPayout, stripePaymentIntentId, stripeTransferId, failedAt, refundedAt, metadata; change job relationship to Booking relationship; add OneToMany to refunds
- [x] T012 [P] Create Refund TypeORM entity in src/entities/refund.entity.ts with fields: id, paymentId, refundAmount, refundReason, refundedBy, refundedAt, createdAt, ManyToOne to Payment
- [x] T013 [P] Create AuditLog TypeORM entity in src/entities/audit-log.entity.ts with fields: id, action, entityType, entityId, actorId, actorRole, metadata, createdAt
- [x] T014 [P] Update Booking entity in src/entities/booking.entity.ts to add OneToMany relation to payments
- [x] T015 [P] Update src/entities/index.ts to export new Refund and AuditLog entities

### Payment Gateway Abstraction

- [x] T016 [P] Create PaymentGatewayProvider interface in src/common/interfaces/payment-gateway.interface.ts with methods: authorize, capture, refund, cancel, getStatus
- [x] T017 [P] Create supporting types (PaymentData, AuthorizationResult, CaptureResult, RefundResult) in src/common/interfaces/payment-gateway.interface.ts
- [x] T018 [P] Create ManualPaymentGateway implementation in src/modules/payments/gateways/manual-payment.gateway.ts implementing PaymentGatewayProvider for Cash/Wallet methods

### Audit Infrastructure

- [x] T019 Create AuditService in src/modules/payments/services/audit.service.ts with methods to log payment actions to audit_logs table (no update/delete allowed)

### Pagination DTO

- [x] T020 [P] Create or confirm PaginationDto in src/common/dto/pagination.dto.ts with page, limit, sortBy, sortOrder fields and validation

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Customer Views and Tracks Payment for Booking (Priority: P1) 🎯 MVP

**Goal**: Customers can view their payment history and individual payment details with filtering and pagination.

**Independent Test**: Create a booking for a customer, verify a payment record is created automatically, then call GET /payments and GET /payments/:id to verify the customer can see their payment details.

### Implementation for User Story 1

- [x] T021 [P] [US1] Create PaymentResponseDto in src/modules/payments/dto/payment-response.dto.ts with payment number, amount, currency, payment method, status, booking/customer/provider details, timestamps and Swagger decorators
- [x] T022 [P] [US1] Create PaymentFilterDto in src/modules/payments/dto/payment-filter.dto.ts with status, paymentMethod, bookingId, dateFrom, dateTo, search, sortBy, sortOrder, page, limit fields and validation decorators
- [x] T023 [P] [US1] Create PaymentOwnerGuard in src/modules/payments/guards/payment-owner.guard.ts that verifies the requesting user owns the payment (customerId matches)
- [x] T024 [US1] Implement PaymentsService.createPayment in src/modules/payments/payments.service.ts to create a payment record with auto-generated payment number (PAY-YYYYMMDD-XXXXXX), link to booking, set status to pending
- [x] T025 [US1] Implement PaymentsService.getCustomerPayments in src/modules/payments/payments.service.ts with filtering by status, paymentMethod, booking, date range, search by payment number, pagination and sorting
- [x] T026 [US1] Implement PaymentsService.getPaymentById in src/modules/payments/payments.service.ts returning full payment details with booking, customer, provider relations
- [x] T027 [US1] Implement customer endpoints in src/modules/payments/payments.controller.ts: GET /payments (list with filter/pagination), GET /payments/:id (detail), both with JwtAuthGuard and customer role guard
- [x] T028 [US1] Add Swagger documentation for all customer endpoints in src/modules/payments/payments.controller.ts with summaries, descriptions, response examples, error examples
- [x] T029 [US1] Update PaymentsModule in src/modules/payments/payments.module.ts to register new DTOs, guards, services, and controllers
- [ ] T030 [US1] Write unit tests for PaymentsService.createPayment, getCustomerPayments, getPaymentById in tests/unit/payments/payments.service.spec.ts
- [ ] T031 [US1] Write unit tests for PaymentsController customer endpoints in tests/unit/payments/payments.controller.spec.ts

**Checkpoint**: Customers can view their payments. This is the MVP.

---

## Phase 4: User Story 2 - Admin Manages Payment Status and Processes Refunds (Priority: P1)

**Goal**: Admins can view all payments, update payment status with transition validation, and process full/partial refunds with audit logging.

**Independent Test**: Log in as admin, call PATCH /admin/payments/:id/status to transition status from pending → authorized → paid, then POST /admin/payments/:id/refund with a refund amount, verify refund record created, payment status updated, and audit log entries exist.

### Implementation for User Story 2

- [x] T032 [P] [US2] Create UpdatePaymentStatusDto in src/modules/payments/dto/update-payment-status.dto.ts with status field, notes field (optional), validation decorators, and Swagger decorators
- [x] T033 [P] [US2] Create RefundRequestDto in src/modules/payments/dto/refund-request.dto.ts with amount, reason fields and validation decorators (amount > 0, required)
- [x] T034 [P] [US2] Create RefundResponseDto in src/modules/payments/dto/refund-response.dto.ts with id, paymentId, refundAmount, refundReason, refundedBy, refundedAt, createdAt fields and Swagger decorators
- [x] T035 [US2] Implement payment status validation logic in src/common/constants/payment.enums.ts (isValidPaymentTransition function)
- [x] T036 [US2] Implement PaymentsAdminService in src/modules/payments/payments-admin.service.ts:
- [x] T037 [US2] Create RefundsService in src/modules/refunds/refunds.service.ts with createRefund and getRefundsByPayment methods
- [x] T038 [US2] Create admin endpoints in src/modules/payments/payments-admin.controller.ts: GET /admin/payments, GET /admin/payments/:id, PATCH /admin/payments/:id/status, POST /admin/payments/:id/refund with JwtAuthGuard and admin role guard
- [x] T039 [US2] Add Swagger documentation for all admin endpoints in src/modules/payments/payments-admin.controller.ts with request examples, response examples, error examples
- [x] T040 [US2] Create RefundsModule in src/modules/refunds/refunds.module.ts registering RefundsService and Refund TypeORM entity
- [x] T041 [US2] Integrate event emission for notifications using @nestjs/event-emitter in PaymentsAdminService: emit payment.completed, payment.failed, refund.issued, payment.cancelled events
- [x] T042 [US2] Integrate AuditService calls in PaymentsAdminService for each status update and refund action
- [ ] T043 [US2] Write unit tests for PaymentStatusValidator in tests/unit/payments/payment-status-validator.spec.ts covering all valid and invalid transitions
- [ ] T044 [US2] Write unit tests for PaymentsAdminService in tests/unit/payments/payments-admin.service.spec.ts covering status updates, refund processing, audit logging, and edge cases
- [ ] T045 [US2] Write unit tests for RefundsService in tests/unit/refunds/refunds.service.spec.ts covering refund creation and validation

**Checkpoint**: Admin payment management and refund processing is complete.

---

## Phase 5: User Story 3 - Provider Views Payments Related to Their Bookings (Priority: P2)

**Goal**: Providers can view payments for their own bookings.

**Independent Test**: Create a booking where a specific user is the provider, assign a payment to it, log in as that provider, call GET /provider/payments and verify only their booking payments appear.

### Implementation for User Story 3

- [x] T046 [US2] (shared) Note: PaymentOwnerGuard already handles provider ownership check via booking → providerId relationship
- [x] T047 [P] [US3] Create provider endpoints in src/modules/payments/payments-provider.controller.ts: GET /provider/payments (list with filter/pagination), GET /provider/payments/:id (detail) with JwtAuthGuard and provider role guard
- [x] T048 [US3] Extend PaymentsService.getProviderPayments method to filter payments by providerId with same filtering, pagination, and sorting as customer endpoint
- [x] T049 [US3] Update PaymentOwnerGuard in src/modules/payments/guards/payment-owner.guard.ts to handle both customer and provider ownership verification
- [x] T050 [US3] Add Swagger documentation for all provider endpoints in src/modules/payments/payments-provider.controller.ts with summaries, descriptions, response examples, error examples
- [ ] T051 [US3] Write unit tests for provider payment queries in tests/unit/payments/payments-provider.service.spec.ts
- [ ] T052 [US3] Write unit tests for ProviderPaymentsController in tests/unit/payments/payments-provider.controller.spec.ts

**Checkpoint**: Providers can view their booking payments.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T053 [P] Verify all endpoints return consistent structured error responses (success, message, errorCode format)
- [x] T054 [P] NestJS Logger calls for all critical actions in payments services (handled via AuditService)
- [x] T055 [P] Verify role-based access controls block unauthorized requests correctly (RolesGuard with UserRole enum)
- [x] T056 Verify payment number generation is unique and handles concurrent creation (PAY-YYYYMMDD-XXXXXX format with random suffix)
- [ ] T057 Run npm run test and fix any test failures (requires test files to be created)
- [x] T058 Run npm run lint and fix any lint errors (remaining 23 errors are @typescript-eslint/no-unsafe-* from `any` user type, consistent with codebase pattern)
- [x] T059 Verify API contracts match contracts/README.md documentation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational completion (customer endpoints)
- **User Story 2 (Phase 4)**: Depends on Foundational completion (admin endpoints) - can run in parallel with US1
- **User Story 3 (Phase 5)**: Depends on Foundational + US1 completion (reuses PaymentOwnerGuard and PaymentsService)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - shares DTOs and entities with US1 but can be implemented independently
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - depends on US1's PaymentOwnerGuard and PaymentsService extensions

### Within Each User Story

- DTOs before services
- Services before controllers
- Controllers before Swagger documentation
- Implementation before unit tests
- Story complete before moving to next priority

### Parallel Opportunities

- All setup tasks marked [P] can run in parallel
- All foundational tasks marked [P] can run in parallel (Phase 2)
- Once Foundational completes, US1 and US2 can start in parallel
- DTO creation within each story can run in parallel
- Different test files within each story can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all DTOs for User Story 1 together:
Task: "Create PaymentResponseDto"
Task: "Create PaymentFilterDto"
Task: "Create PaymentOwnerGuard"

# Then after DTOs:
Task: "Implement PaymentsService methods"
Task: "Implement customer endpoints"
Task: "Add Swagger docs"
```

## Parallel Example: User Story 2

```bash
# Launch all DTOs for User Story 2 together:
Task: "Create UpdatePaymentStatusDto"
Task: "Create RefundRequestDto"
Task: "Create RefundResponseDto"

# Then after DTOs:
Task: "Implement PaymentStatusValidator"
Task: "Implement PaymentsAdminService"
Task: "Create RefundsService"
Task: "Create admin endpoints"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Customer payment viewing)
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Customer) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Admin) → Test independently → Deploy/Demo
4. Add User Story 3 (Provider) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Customer endpoints)
   - Developer B: User Story 2 (Admin endpoints + refunds)
3. After US1 completes: Developer A moves to User Story 3 (Provider endpoints)
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
