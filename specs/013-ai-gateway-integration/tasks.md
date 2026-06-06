# Tasks: AI Gateway & Integration Module

**Input**: Design documents from `specs/013-ai-gateway-integration/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks are included as acceptance verification per user story. Unit tests follow Constitution P15 step 10.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create AI Gateway module directory structure at `src/modules/ai-gateway/` with subdirectories: `dto/`, `services/`, `enums/`, `guards/`, `interceptors/`, `filters/`
- [ ] T002 [P] Add AI configuration environment variables to `.env.example` (AI_SERVICE_URL, AI_REQUEST_TIMEOUT, AI_RETRY_MAX, AI_RETRY_BASE_DELAY, AI_CIRCUIT_BREAKER_THRESHOLD, AI_CIRCUIT_BREAKER_COOLDOWN, AI_RATE_LIMIT_TTL, AI_RATE_LIMIT_MAX)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete. Aligns with Constitution P15 steps 2-4.

### Enums (P4/P6)

- [ ] T003 [P] Create `AiFeatureType` enum in `src/modules/ai-gateway/enums/ai-feature-type.enum.ts` with values: chat, classification, image_analysis, cost_estimation, provider_recommendation, ocr
- [ ] T004 [P] Create `AiRequestStatus` enum in `src/modules/ai-gateway/enums/ai-request-status.enum.ts` with values: pending, success, failed, timeout, rate_limited, circuit_open
- [ ] T005 [P] Create `CircuitBreakerState` enum in `src/modules/ai-gateway/enums/circuit-breaker-state.enum.ts` with values: closed, open, half_open
- [ ] T006 [P] Create `OcrDocumentType` enum in `src/modules/ai-gateway/enums/ocr-document-type.enum.ts` with values: national_id, passport, professional_license
- [ ] T007 [P] Create `OcrValidationStatus` enum in `src/modules/ai-gateway/enums/ocr-validation-status.enum.ts` with values: verified, suspected_fraud, unclear

### Database Entities (P1/P9)

- [ ] T008 [P] Create `AiRequestLog` TypeORM entity in `src/entities/ai-request-log.entity.ts` with fields: id (UUID PK), userId (UUID FK to users), featureType (enum), requestPayload (JSONB), responsePayload (JSONB nullable), status (enum), processingTime (int nullable), errorMessage (text nullable), ipAddress (varchar nullable), createdAt, updatedAt. Add indexes on userId, featureType, status, createdAt, and composite (userId, featureType).
- [ ] T009 [P] Create `AiHealthMonitor` TypeORM entity in `src/entities/ai-health-monitor.entity.ts` with fields: id (UUID PK), serviceName (unique varchar), state (enum), consecutiveFailures (int), lastFailureAt, lastSuccessAt, cooldownUntil, totalRequests, totalFailures, totalSuccesses, createdAt, updatedAt. Add unique index on serviceName.

### Error Handling (P10/P11)

- [ ] T010 [P] Create `ErrorResponseDto` in `src/modules/ai-gateway/dto/error-response.dto.ts` with fields: success (boolean, default false), errorCode (string), message (string). Add Swagger decorators and examples for all error codes defined in contracts/README.md.
- [ ] T011 Create `AiExceptionFilter` in `src/modules/ai-gateway/filters/ai-exception.filter.ts` that catches HttpException and returns standardized ErrorResponseDto format. Map specific exceptions to error codes (VALIDATION_ERROR, AI_SERVICE_UNAVAILABLE, AI_REQUEST_TIMEOUT, RATE_LIMIT_EXCEEDED, FILE_TOO_LARGE, UNSUPPORTED_FILE_TYPE).

### Core Services (P2)

- [ ] T012 Create `AiClientService` in `src/modules/ai-gateway/services/ai-client.service.ts` — HTTP client using axios with configurable AI_SERVICE_URL, 30s timeout, and request/response interceptors for logging. Method: `callAiService(featureType: AiFeatureType, payload: any): Promise<any>` that forwards to `POST {AI_SERVICE_URL}/ai/{featureType}`.
- [ ] T013 Create `CircuitBreakerService` in `src/modules/ai-gateway/services/circuit-breaker.service.ts` — state machine (closed→open after 5 consecutive failures, open→half_open after 30s cooldown, half_open→closed on success, half_open→open on failure). Methods: `isOpen(serviceName): boolean`, `recordSuccess(serviceName)`, `recordFailure(serviceName)`. Uses AiHealthMonitor entity for persistence.
- [ ] T014 Create `RetryService` in `src/modules/ai-gateway/services/retry.service.ts` — wraps AiClientService calls with exponential backoff (base delay 100ms, factor 2x, max 3 retries). Only retries on transient errors (network timeouts, 5xx responses). Method: `executeWithRetry(featureType, payload, context): Promise<any>`.
- [ ] T015 Create `FileValidatorService` in `src/modules/ai-gateway/services/file-validator.service.ts` — validates file type (JPEG/PNG/WebP), file size (max 10MB), and file count (max 5). Methods: `validateImageFile(file)`, `validateDocumentFile(file)`, `validateFileCount(files, maxCount)`. Throws appropriate error codes on failure.
- [ ] T016 Create `AiRequestLogService` in `src/modules/ai-gateway/services/ai-request-log.service.ts` — CRUD for AiRequestLog entity. Methods: `createLog(dto)`, `updateLog(id, updates)`, `queryLogs(filters)`. Records userId, featureType, request/response payloads, status, processingTime, errorMessage, ipAddress.
- [ ] T017 Create `AiGatewayService` in `src/modules/ai-gateway/services/ai-gateway.service.ts` — orchestrates the full flow: checks circuit breaker → logs request (pending) → calls RetryService → logs response (success/failed/timeout) → returns result. Handles timeout via Promise.race with 30s deadline. Returns structured errors for all failure modes.

### Cross-Cutting (P7/P8)

- [ ] T018 Create `AiRateLimitGuard` in `src/modules/ai-gateway/guards/ai-rate-limit.guard.ts` — extends @nestjs/throttler to track per-user rate limits using JWT user ID (not IP). Default: 100 requests per 60s window. Configurable via AI_RATE_LIMIT_TTL and AI_RATE_LIMIT_MAX env vars.
- [ ] T019 Create `AiLoggingInterceptor` in `src/modules/ai-gateway/interceptors/ai-logging.interceptor.ts` — logs every request with NestJS Logger (user ID, feature type, endpoint, request timestamp, response timestamp, processing time, status).

### Module Wiring

- [ ] T020 Create `AiGatewayModule` in `src/modules/ai-gateway/ai-gateway.module.ts` importing TypeOrmModule.forFeature([AiRequestLog, AiHealthMonitor]), HttpModule, ThrottlerModule. Registers all services, providers exports for AiGatewayService, and applies AiLoggingInterceptor globally within the module.
- [ ] T021 Register `AiGatewayModule` in `src/app.module.ts` imports array

**Checkpoint**: Foundation ready — all shared infrastructure is in place. User story implementation can now begin, each adding DTOs and endpoints to the existing controller.

---

## Phase 3: User Story 1 — AI Chat Assistance (Priority: P1) 🎯 MVP

**Goal**: Users can ask questions via AI chat and receive helpful responses. The system forwards the question to the AI service and returns the response within 30s.

**Independent Test**: Submit a chat question via `POST /api/v1/ai/chat` with a valid JWT and verify a response is returned. Submit without JWT and verify 401. Simulate AI service down and verify 503.

### Implementation for User Story 1

- [ ] T022 [P] [US1] Create `ChatRequestDto` in `src/modules/ai-gateway/dto/chat-request.dto.ts` with field `message` (string, 1-2000 characters). Add @ApiProperty decorator with example "How do I fix a leaking faucet?"
- [ ] T023 [P] [US1] Create `ChatResponseDto` in `src/modules/ai-gateway/dto/chat-response.dto.ts` with fields `reply` (string) and `conversationId` (string, optional). Add Swagger decorators with example response.
- [ ] T024 [US1] Add `POST /api/v1/ai/chat` endpoint in `src/modules/ai-gateway/ai-gateway.controller.ts` guarded with @UseGuards(JwtAuthGuard, AiRateLimitGuard). Accepts ChatRequestDto, calls AiGatewayService with AiFeatureType.chat, returns ChatResponseDto. Add @ApiOperation, @ApiBearerAuth, @ApiResponse decorators.
- [ ] T025 [P] [US1] Create unit test for Chat endpoint in `src/modules/ai-gateway/ai-gateway.controller.spec.ts` testing authenticated request, unauthenticated request (401), and AI service unavailable (503)
- [ ] T026 [P] [US1] Create unit test for AiGatewayService chat flow in `src/modules/ai-gateway/services/ai-gateway.service.spec.ts` testing successful response, timeout, and circuit breaker open scenarios

**Checkpoint**: User Story 1 is fully functional and independently testable. MVP scope deliverable.

---

## Phase 4: User Story 2 — Service Classification (Priority: P1)

**Goal**: Users can describe a home maintenance problem and get a service category classification with confidence score.

**Independent Test**: Submit a problem description via `POST /api/v1/ai/classify` and verify response contains category, suggestedService, and confidenceScore (0-1). Submit empty description and verify 422.

### Implementation for User Story 2

- [ ] T027 [P] [US2] Create `ClassifyServiceRequestDto` in `src/modules/ai-gateway/dto/classify-service-request.dto.ts` with field `description` (string, 10-1000 characters). Add @ApiProperty with example.
- [ ] T028 [P] [US2] Create `ClassifyServiceResponseDto` in `src/modules/ai-gateway/dto/classify-service-response.dto.ts` with fields `category` (string), `suggestedService` (string), `confidenceScore` (number, 0-1). Add Swagger decorators.
- [ ] T029 [US2] Add `POST /api/v1/ai/classify` endpoint in `src/modules/ai-gateway/ai-gateway.controller.ts` guarded with @UseGuards(JwtAuthGuard, AiRateLimitGuard). Calls AiGatewayService with AiFeatureType.classification. Add Swagger decorators.
- [ ] T030 [P] [US2] Create unit test for Classify endpoint in `src/modules/ai-gateway/ai-gateway.controller.spec.ts` testing successful classification, empty description validation (422), and unsupported language handling

**Checkpoint**: Stories 1 and 2 both functional and independently testable.

---

## Phase 5: User Story 3 — Image Problem Detection (Priority: P1)

**Goal**: Users can upload an image of a maintenance problem and get AI-powered analysis with problem type, service category, confidence score, and recommendations.

**Independent Test**: Upload a valid image via `POST /api/v1/ai/analyze-image` (multipart) and verify response contains problemType, serviceCategory, confidenceScore, recommendations[]. Upload oversized file and verify 413. Upload unsupported format and verify 415.

### Implementation for User Story 3

- [ ] T031 [P] [US3] Create `AnalyzeImageRequestDto` in `src/modules/ai-gateway/dto/analyze-image-request.dto.ts` as a file upload DTO (no body fields — image passed via multipart). Add @ApiProperty with file type.
- [ ] T032 [P] [US3] Create `AnalyzeImageResponseDto` in `src/modules/ai-gateway/dto/analyze-image-response.dto.ts` with fields `problemType`, `serviceCategory`, `confidenceScore` (number, 0-1), `recommendations` (string[]). Add Swagger decorators.
- [ ] T033 [US3] Add `POST /api/v1/ai/analyze-image` endpoint in `src/modules/ai-gateway/ai-gateway.controller.ts` using @UseInterceptors(FileInterceptor('image')) with multer config for JPEG/PNG/WebP only, max 10MB. Validates via FileValidatorService, then calls AiGatewayService with AiFeatureType.image_analysis. Add Swagger decorators with @ApiConsumes('multipart/form-data').
- [ ] T034 [P] [US3] Create unit test for AnalyzeImage endpoint in `src/modules/ai-gateway/ai-gateway.controller.spec.ts` testing valid image upload, oversized file (413), unsupported format (415), and low-confidence result scenarios
- [ ] T035 [P] [US3] Create unit test for FileValidatorService in `src/modules/ai-gateway/services/file-validator.service.spec.ts` testing valid/invalid file types, size limits, and edge cases

**Checkpoint**: P1 stories (1-3) all functional.

---

## Phase 6: User Story 4 — Cost Estimation (Priority: P2)

**Goal**: Users can get estimated cost range and duration for a service based on description and category, with optional image attachments.

**Independent Test**: Submit a cost estimation request with description and category via `POST /api/v1/ai/estimate-cost` and verify response contains estimatedCostRange (min, max), estimatedDuration, and confidenceScore. Submit invalid category and verify 422.

### Implementation for User Story 4

- [ ] T036 [P] [US4] Create `EstimateCostRequestDto` in `src/modules/ai-gateway/dto/estimate-cost-request.dto.ts` with fields `description` (string, required), `category` (string, required), `images` (array of files, optional, max 5). Add validation decorators.
- [ ] T037 [P] [US4] Create `EstimateCostResponseDto` in `src/modules/ai-gateway/dto/estimate-cost-response.dto.ts` with fields `estimatedCostRange` ({ min: number, max: number }), `estimatedDuration` (string), `confidenceScore` (number, 0-1). Add Swagger decorators.
- [ ] T038 [US4] Add `POST /api/v1/ai/estimate-cost` endpoint in `src/modules/ai-gateway/ai-gateway.controller.ts` accepting EstimateCostRequestDto with optional file uploads. Validates category, passes to AiGatewayService with AiFeatureType.cost_estimation. Add Swagger decorators.
- [ ] T039 [P] [US4] Create unit test for EstimateCost endpoint in `src/modules/ai-gateway/ai-gateway.controller.spec.ts` testing valid request, invalid category (422), and request with optional images

**Checkpoint**: Stories 1-4 all functional.

---

## Phase 7: User Story 5 — Provider Recommendation (Priority: P2)

**Goal**: Users can get provider recommendations based on their problem description, with match scores and explanations.

**Independent Test**: Submit a provider recommendation request via `POST /api/v1/ai/recommend-providers` and verify response contains recommendedProviders[] with providerId, matchScore, explanation. Test empty list response when no providers match.

### Implementation for User Story 5

- [ ] T040 [P] [US5] Create `RecommendProviderRequestDto` in `src/modules/ai-gateway/dto/recommend-provider-request.dto.ts` with fields `description` (string, required), `location` (string, optional), `category` (string, optional). Add validation decorators.
- [ ] T041 [P] [US5] Create `RecommendProviderResponseDto` in `src/modules/ai-gateway/dto/recommend-provider-response.dto.ts` with field `recommendedProviders` (array of { providerId: string, matchScore: number, explanation: string }). Add Swagger decorators.
- [ ] T042 [US5] Add `POST /api/v1/ai/recommend-providers` endpoint in `src/modules/ai-gateway/ai-gateway.controller.ts` calling AiGatewayService with AiFeatureType.provider_recommendation. Add Swagger decorators.
- [ ] T043 [P] [US5] Create unit test for RecommendProvider endpoint in `src/modules/ai-gateway/ai-gateway.controller.spec.ts` testing successful recommendation and empty provider list response

**Checkpoint**: Stories 1-5 all functional.

---

## Phase 8: User Story 6 — OCR Document Verification (Priority: P2)

**Goal**: Provider users can upload identity documents for OCR-based verification, extracting document data and returning validation status.

**Independent Test**: Upload a valid document image with documentType via `POST /api/v1/ai/ocr` (multipart) and verify response contains extractedData, validationStatus, and confidenceScore. Upload blurry image and verify low confidence with recommendation.

### Implementation for User Story 6

- [ ] T044 [P] [US6] Create `OcrRequestDto` in `src/modules/ai-gateway/dto/ocr-request.dto.ts` as multipart with fields `documentImage` (file, required) and `documentType` (enum: national_id, passport, professional_license). Add validation and Swagger decorators.
- [ ] T045 [P] [US6] Create `OcrResponseDto` in `src/modules/ai-gateway/dto/ocr-response.dto.ts` with fields `extractedData` (object), `validationStatus` (enum: verified, suspected_fraud, unclear), `confidenceScore` (number, 0-1). Add Swagger decorators for each validation status.
- [ ] T046 [US6] Add `POST /api/v1/ai/ocr` endpoint in `src/modules/ai-gateway/ai-gateway.controller.ts` using @UseInterceptors(FileInterceptor('documentImage')). Validates documentImage and documentType, then calls AiGatewayService with AiFeatureType.ocr. Add Swagger decorators with @ApiConsumes('multipart/form-data').
- [ ] T047 [P] [US6] Create unit test for Ocr endpoint in `src/modules/ai-gateway/ai-gateway.controller.spec.ts` testing valid document, blurry image (low confidence), and non-document image scenarios

**Checkpoint**: All 6 user stories functional and independently testable.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T048 [P] Add missing Swagger documentation examples for all AI endpoints in `src/modules/ai-gateway/` DTOs and controller (ensure SWAG-001 compliance)
- [ ] T049 [P] Update `.env.example` with all AI_* configuration variables and default values
- [ ] T050 [P] Create integration test for full request lifecycle in `test/ai-gateway.e2e.spec.ts` covering authentication, rate limiting, circuit breaker, file validation, and error responses
- [ ] T051 Run full test suite: `npm test` — ensure all existing tests still pass and new AI gateway tests pass
- [ ] T052 Run lint: `npm run lint` — ensure code quality standards
- [ ] T053 Run build: `npm run build` — ensure successful compilation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User stories must proceed sequentially (each modifies `ai-gateway.controller.ts`)
  - Order: P1 stories first (US1→US2→US3), then P2 stories (US4→US5→US6)
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 Chat (P1)**: Can start after Foundational — No dependencies on other stories
- **US2 Classification (P1)**: Depends on US1 (same controller, sequential endpoint addition)
- **US3 Image Analysis (P1)**: Depends on US2 (same controller)
- **US4 Cost Estimation (P2)**: Depends on US3 (same controller)
- **US5 Provider Recommendation (P2)**: Depends on US4 (same controller)
- **US6 OCR (P2)**: Depends on US5 (same controller)

### Within Each User Story

- DTOs before controller endpoint
- Controller endpoint before tests
- Story complete before moving to next priority

### Parallel Opportunities

- All [P] tasks within a phase can run in parallel (different files)
- All enum tasks (T003-T007) can run in parallel
- Entity tasks (T008-T009) can run in parallel
- DTO creation tasks within a single US can run in parallel (T022-T023, T027-T028, etc.)
- Test tasks within a single US can run in parallel
- Polish tasks (T048-T050) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Create both DTOs in parallel:
Task: "Create ChatRequestDto in src/modules/ai-gateway/dto/chat-request.dto.ts"
Task: "Create ChatResponseDto in src/modules/ai-gateway/dto/chat-response.dto.ts"

# Create tests in parallel (after endpoint is done):
Task: "Create unit test for Chat endpoint in ai-gateway.controller.spec.ts"
Task: "Create unit test for AiGatewayService chat flow"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (AI Chat)
4. **STOP and VALIDATE**: Test Chat endpoint independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (entities, services, module)
2. Add User Story 1 (Chat) → Test independently → Deliver MVP
3. Add User Story 2 (Classification) → Test independently → Deploy
4. Add User Story 3 (Image Analysis) → Test independently → Deploy
5. Add User Story 4 (Cost Estimation) → Test independently → Deploy
6. Add User Story 5 (Provider Recommendation) → Test independently → Deploy
7. Add User Story 6 (OCR) → Test independently → Deploy

### Parallel Team Strategy

With multiple developers:
1. Team completes Setup + Foundational together (shared foundation)
2. Once Foundational is done:
   - All stories must build sequentially on the same controller file
   - Developer A: US1 → US2 → US3 → US4 → US5 → US6 (sequential)
   - Within each story, [P] tasks can be distributed (e.g., one dev creates DTOs, another creates tests)
3. Each story adds a new endpoint without breaking existing ones

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- All controller endpoint additions must preserve existing endpoints (backward compatible)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
