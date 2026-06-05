---

description: "Task list for Provider Verification System implementation"

---

# Tasks: Provider Verification System

**Input**: Design documents from `/specs/009-provider-verification/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test tasks are included as part of each user story phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **NestJS backend**: `src/entities/`, `src/modules/`, `prisma/`
- Tests: `test/unit/`, `test/integration/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure for the Provider Verification module

- [ ] T001 Create provider-verification module directory structure under `src/modules/provider-verification/` with sub-directories: `dto/`, `guards/`, `services/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T002 [P] Create `ProviderVerification` entity in `src/entities/provider-verification.entity.ts` with all fields (id, providerId, status, rejectionReason, suspensionReason, submittedAt, reviewedAt, reviewedBy, createdAt, updatedAt), relationships to ProviderProfile and VerificationDocument/VerificationHistory, and indexes on providerId, status, submittedAt, reviewedBy
- [ ] T003 [P] Create `VerificationDocument` entity in `src/entities/verification-document.entity.ts` with fields (id, verificationId, documentType, documentUrl, originalName, mimeType, fileSize, uploadedAt, createdAt) and relationship to ProviderVerification
- [ ] T004 [P] Create `VerificationHistory` entity in `src/entities/verification-history.entity.ts` with fields (id, verificationId, oldStatus, newStatus, changedBy, changedByRole, notes, createdAt) and relationship to ProviderVerification
- [ ] T005 Update `prisma/schema.prisma` with provider_verifications, verification_documents, and verification_history models matching the TypeORM entities, using snake_case table names, UUID primary keys, and proper indexes
- [ ] T006 Generate Prisma migration: `npx prisma migrate dev --name add_provider_verification --create-only` then `npx prisma migrate dev`
- [ ] T007 [P] Create `StorageProvider` interface in `src/common/interfaces/storage-provider.interface.ts` with upload, delete, and getUrl methods
- [ ] T008 [P] Implement `LocalStorageProvider` in `src/modules/provider-verification/services/local-storage-provider.service.ts` using multer diskStorage (destination: ./uploads, fileFilter: jpg|jpeg|png|pdf, limits: 10MB)
- [ ] T009 [P] Create all 9 DTOs in `src/modules/provider-verification/dto/` with class-validator rules and @ApiProperty decorators: `submit-verification.dto.ts`, `verification-status-response.dto.ts`, `upload-document.dto.ts`, `verification-documents-response.dto.ts`, `admin-verification-filter.dto.ts`, `admin-verification-response.dto.ts`, `approve-verification.dto.ts`, `reject-verification.dto.ts`, `suspend-reactivate.dto.ts`
- [ ] T010 Create `ProviderVerificationModule` in `src/modules/provider-verification/provider-verification.module.ts` importing TypeOrmModule.forFeature([ProviderVerification, VerificationDocument, VerificationHistory, AuditLog]), registering controllers and providers, and exporting the module
- [ ] T011 Create `VerificationOwnerGuard` in `src/modules/provider-verification/guards/verification-owner.guard.ts` that checks the authenticated user owns the verification record (by providerId match)
- [ ] T012 [P] Create `HistoryService` in `src/modules/provider-verification/services/history.service.ts` with append-only recordVerificationChange method that writes to VerificationHistory (oldStatus, newStatus, changedBy, changedByRole, notes)
- [ ] T013 [P] Create `AuditService` in `src/modules/provider-verification/services/audit.service.ts` that logs all verification actions to the AuditLog entity (reusing existing audit_logs table)
- [ ] T014 Add verification notification types (VERIFICATION_SUBMITTED, VERIFICATION_APPROVED, VERIFICATION_REJECTED, VERIFICATION_SUSPENDED, VERIFICATION_REACTIVATED) to `NotificationType` enum in `src/common/constants/user.enums.ts`
- [ ] T015 Import `ProviderVerificationModule` into `src/app.module.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Provider submits verification request (Priority: P1) 🎯 MVP

**Goal**: A registered provider with a completed profile can upload documents and submit a verification request, changing their status from pending to under_review.

**Independent Test**: A provider with a complete profile can upload a required identity document, submit verification, and confirm the status changes to "under_review". The provider receives a notification about the submission.

### Tests for User Story 1

- [ ] T016 [P] [US1] Unit test for document upload validation (invalid file types, missing files) in `test/unit/provider-verification/document.service.spec.ts`
- [ ] T017 [P] [US1] Unit test for verification submission (success, missing documents, already submitted) in `test/unit/provider-verification/provider-verification.service.spec.ts`

### Implementation for User Story 1

- [ ] T018 [US1] Implement `DocumentService` in `src/modules/provider-verification/services/document.service.ts` with upload, delete, and list methods using StorageProvider interface
- [ ] T019 [US1] Implement `ProviderVerificationService` in `src/modules/provider-verification/provider-verification.service.ts` with submit method that: validates documents exist, creates/updates verification record, records history entry via HistoryService, emits verification.submitted event, and logs to AuditService
- [ ] T020 [US1] Implement `ProviderVerificationController` in `src/modules/provider-verification/provider-verification.controller.ts` with POST /submit, POST /documents endpoints, using JwtAuthGuard and VerificationOwnerGuard
- [ ] T021 [US1] Add complete Swagger documentation (ApiTags, ApiOperation, ApiBearerAuth, ApiResponse) to all provider endpoints in the controller
- [ ] T022 [US1] Create `VerificationEventsHandler` in `src/modules/notifications/handlers/verification-events.handler.ts` with @OnEvent('verification.submitted') handler that calls NotificationsService.create
- [ ] T023 [US1] Register VerificationEventsHandler in `src/modules/notifications/notifications.module.ts`

**Checkpoint**: User Story 1 fully functional - provider can upload documents and submit verification

---

## Phase 4: User Story 2 - Admin reviews and decides on verification (Priority: P1)

**Goal**: An admin can view pending applications, examine documents, and approve or reject provider verification with appropriate reasoning.

**Independent Test**: An admin can list verification applications, view a specific application with documents, approve it, and confirm the provider's status changes to "approved" with notification sent.

### Tests for User Story 2

- [ ] T024 [P] [US2] Unit test for admin listing with filters and pagination in `test/unit/provider-verification/provider-verification-admin.service.spec.ts`
- [ ] T025 [P] [US2] Unit test for admin approve/reject actions (success, invalid status transitions, missing rejection reason, self-approval prevention) in `test/unit/provider-verification/provider-verification-admin.service.spec.ts`

### Implementation for User Story 2

- [ ] T026 [US2] Implement `ProviderVerificationAdminService` in `src/modules/provider-verification/provider-verification-admin.service.ts` with: findAll (filtered, paginated, sorted listing), findOne (full detail with documents and history), approve (status transition under_review -> approved, update provider profile), reject (status transition under_review -> rejected, rejection reason required), emit events, record history, log audit
- [ ] T027 [US2] Implement `ProviderVerificationAdminController` in `src/modules/provider-verification/provider-verification-admin.controller.ts` with GET /admin/provider-verifications, GET /admin/provider-verifications/:id, PATCH /admin/provider-verifications/:id/approve, PATCH /admin/provider-verifications/:id/reject, using JwtAuthGuard and RolesGuard with @Roles(UserRole.ADMIN)
- [ ] T028 [US2] Add complete Swagger documentation to all admin endpoints in the controller
- [ ] T029 [US2] Extend `VerificationEventsHandler` with @OnEvent('verification.approved') and @OnEvent('verification.rejected') handlers
- [ ] T030 [US2] Update `ProviderProfile.verificationStatus` field in database when verification is approved or rejected (sync the status)

**Checkpoint**: User Stories 1 AND 2 fully functional - complete verification workflow from submission to admin decision

---

## Phase 5: User Story 3 - Provider views verification status and history (Priority: P2)

**Goal**: A provider can check their current verification status and view the immutable history of all actions taken on their application.

**Independent Test**: A provider can view their current verification status and a chronological list of all status changes with timestamps and notes.

### Tests for User Story 3

- [ ] T031 [P] [US3] Unit test for status retrieval in `test/unit/provider-verification/provider-verification.service.spec.ts`
- [ ] T032 [P] [US3] Unit test for history retrieval in `test/unit/provider-verification/history.service.spec.ts`

### Implementation for User Story 3

- [ ] T033 [US3] Add getStatus method to `ProviderVerificationService` returning current status, submittedAt, reviewedAt, reviewer info, and reason (if applicable)
- [ ] T034 [US3] Add getHistory method to `HistoryService` returning chronological list of status changes
- [ ] T035 [US3] Add GET /status and GET /history endpoints to `ProviderVerificationController`

**Checkpoint**: Providers can track their verification progress end-to-end

---

## Phase 6: User Story 4 - Admin suspends and reactivates providers (Priority: P2)

**Goal**: An admin can suspend an approved provider with a reason, and later reactivate them. Suspended providers are hidden from search results.

**Independent Test**: An admin can suspend an approved provider with a reason, verify the provider disappears from listings, then reactivate them and confirm they reappear.

### Tests for User Story 4

- [ ] T036 [P] [US4] Unit test for suspend action (success, missing reason, invalid source status) in `test/unit/provider-verification/provider-verification-admin.service.spec.ts`
- [ ] T037 [P] [US4] Unit test for reactivate action (success, invalid source status) in `test/unit/provider-verification/provider-verification-admin.service.spec.ts`

### Implementation for User Story 4

- [ ] T038 [US4] Add suspend method to `ProviderVerificationAdminService` (status transition approved -> suspended, suspension reason required, emit verification.suspended event, record history, log audit, update provider profile)
- [ ] T039 [US4] Add reactivate method to `ProviderVerificationAdminService` (status transition suspended -> approved, emit verification.reactivated event, record history, log audit, update provider profile)
- [ ] T040 [US4] Add PATCH /admin/provider-verifications/:id/suspend and PATCH /admin/provider-verifications/:id/reactivate endpoints to `ProviderVerificationAdminController`
- [ ] T041 [US4] Extend `VerificationEventsHandler` with @OnEvent('verification.suspended') and @OnEvent('verification.reactivated') handlers

**Checkpoint**: Full lifecycle management - submit, review, approve, reject, suspend, reactivate

---

## Phase 7: User Story 5 - Provider manages verification documents (Priority: P3)

**Goal**: A provider can view all uploaded documents and delete them while verification is in pending status.

**Independent Test**: A provider can upload multiple documents, view them in a list, and delete a specific document before submitting their verification.

### Tests for User Story 5

- [ ] T042 [P] [US5] Unit test for document deletion (success during pending, blocked during under_review) in `test/unit/provider-verification/document.service.spec.ts`

### Implementation for User Story 5

- [ ] T043 [US5] Add getDocuments (list all) and deleteDocument methods to `DocumentService` (delete only allowed when verification status is pending)
- [ ] T044 [US5] Add GET /documents and DELETE /documents/:id endpoints to `ProviderVerificationController`

**Checkpoint**: Complete document management - upload, list, delete with status-aware permissions

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T045 [P] Create E2E test for complete provider verification flow (upload → submit → admin approve) in `test/integration/provider-verification.e2e-spec.ts`
- [ ] T046 [P] Create E2E test for admin suspend/reactivate flow in `test/integration/provider-verification.e2e-spec.ts`
- [ ] T047 [P] Create unit test for VerificationOwnerGuard in `test/unit/provider-verification/verification-owner.guard.spec.ts`
- [ ] T048 [P] Create unit test for AuditService in `test/unit/provider-verification/audit.service.spec.ts`
- [ ] T049 Security hardening: ensure self-approval prevention is tested in both service and guard layers
- [ ] T050 Run full test suite: `npx jest --testPathPattern="provider-verification"` and fix any failures
- [ ] T051 Verify Swagger UI at `http://localhost:3000/api/docs` shows all endpoints with proper documentation
- [ ] T052 Run quickstart.md validation steps end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational completion
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational - Requires US1 verification records to exist for testing but is independently implementable
- **User Story 3 (P2)**: Can start after Foundational - Independent read-only flow
- **User Story 4 (P2)**: Can start after Foundational - Independent admin flow (needs approved provider for testing but not for implementation)
- **User Story 5 (P3)**: Can start after Foundational - Independent document management flow

### Within Each User Story

- Tests MUST be written first (red phase)
- Services before controllers
- Core implementation before notification/audit integration
- Story complete before moving to next priority

### Parallel Opportunities

- **Phase 2 (Foundational)**: T002, T003, T004 (entities) are fully parallel. T007, T008, T009, T012, T013, T014 can run in parallel
- **Phase 3 (US1)**: T016 and T017 (tests) are parallel. T018 and T019 (services) are parallel
- **Phase 4 (US2)**: T024 and T025 (tests) are parallel
- **Phase 5 (US3)**: T031 and T032 (tests) are parallel. T033 and T034 (services) are parallel
- **Phase 6 (US4)**: T036 and T037 (tests) are parallel
- **Phase 8 (Polish)**: All test tasks T045-T048 are fully parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for document upload validation in test/unit/provider-verification/document.service.spec.ts"
Task: "Unit test for verification submission in test/unit/provider-verification/provider-verification.service.spec.ts"

# Launch all services for User Story 1 together:
Task: "Implement DocumentService in src/modules/provider-verification/services/document.service.ts"
Task: "Implement ProviderVerificationService in src/modules/provider-verification/provider-verification.service.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2 — Both P1)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Provider submits verification)
4. Complete Phase 4: User Story 2 (Admin reviews and decides)
5. **STOP and VALIDATE**: Full verification workflow from provider upload → admin approve
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Submit verification (MVP foundation)
3. Add User Story 2 → Admin review (Complete verification workflow!)
4. Add User Story 3 → Provider status visibility
5. Add User Story 4 → Admin suspension management
6. Add User Story 5 → Extended document management
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 5 (independent document management)
3. After US1 and US2 complete:
   - Developer A: User Story 3
   - Developer B: User Story 4
4. Stories complete and integrate independently

---

## Task Summary

| Phase | Story | Tasks | Parallelizable |
|-------|-------|-------|----------------|
| Phase 1: Setup | — | 1 | 0 |
| Phase 2: Foundational | — | 14 | 10 |
| Phase 3: US1 - Provider submits | [US1] | 8 | 4 |
| Phase 4: US2 - Admin reviews | [US2] | 7 | 2 |
| Phase 5: US3 - View status/history | [US3] | 5 | 4 |
| Phase 6: US4 - Suspend/Reactivate | [US4] | 6 | 2 |
| Phase 7: US5 - Manage documents | [US5] | 3 | 1 |
| Phase 8: Polish | — | 8 | 4 |
| **Total** | | **52** | **27** |

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All tasks reference exact file paths from the plan.md project structure
